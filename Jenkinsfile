#!groovy
def BRANCH = null

pipeline {

    parameters {
        string(name: 'RELEASE_BRANCH', trim: true, defaultValue: ' ', description: 'The branch in github.corp.clover.com that we would like to release e.g. 3.1.0. Technically can be any branch name, commit hashes are not supported at this time.')
        string(name: 'RELEASE_VERSION', trim: true, defaultValue: ' ', description: 'Version we are releasing, this will be the version in NPM and should be major.minor.patch (3.1.0).')
        string(name: 'PUBLIC_REMOTE', trim: true, defaultValue: 'git@github.com:clover/remote-pay-cloud.git', description: 'git ssh path for the public facing git repo.  Please use the default value unless you know what you are doing!')
        booleanParam(name: 'BUILD_WITH_STAGED_ARTIFACTS', defaultValue: true, description: 'Should we build with artifacts from Clover artifactory?  Allows us to build with a staged version of remote-pay-cloud-api.')
        booleanParam(name: 'PUBLISH_RELEASE', defaultValue: false, description: 'Should we publish a release to npmjs?')
        booleanParam(name: 'GIT_RELEASE', defaultValue: false, description: 'Should we generate docs, push the latest to the public facing repo (PUBLIC_REMOTE) and generate a git release?')
    }

    agent {
        label 'small'
    }

    environment {
        VERSION = "build.${BUILD_ID}"
        NODEJS_IMAGE = "gcr.io/clover-container-registries/helpcenter/jenkins-nodejs-agent"
        CONTAINER_USER = 'jenkins'
        CACHE_VOL = "/home/jenkins/.cache:/home/${CONTAINER_USER}/.cache"
    }

    stages {
        stage('Set up') {
            steps {
                sh 'getent passwd | grep jenkins > /tmp/passwd'
                script {
                    BRANCH = params.RELEASE_BRANCH ?: env.GIT_BRANCH
                    echo "Branch is ${BRANCH} ..."
                }
            }
        }
        stage('Prep') {
            steps {
                sh "git config user.name 'jenkins-corp'"
                sh "git config user.email jenkins-corp@clover.com"
                sh "git checkout ${BRANCH}" //make sure our refs match so we can commit and push
            }
        }
        stage('Build and Dev Deploy') {
            agent {
                docker {
                    image "${NODEJS_IMAGE}"
                    reuseNode true
                    args "-v ${CACHE_VOL} " +
                         "-v /home/jenkins/.ssh:/home/jenkins/.ssh:ro "
                }
            }
            stages {
                stage('Build JS') {
                    steps {
                        script {
                            if (params.BUILD_WITH_STAGED_ARTIFACTS == true) {
                                withNPM(npmrcConfig: 'jenkins-noscope-artifactory-npmrc') {
                                    echo "Building with staged artifacts ..."
                                    sh "npm install"
                                }
                            } else {
                                withNPM(npmrcConfig: 'jenkins-npmjs-npmrc') {
                                    echo "Building with public artifacts ..."
                                    sh "npm install"
                                }
                            }
                        }
                        sh script: 'npm run build'
                    }
                }
                stage('Deploy to Artifactory') {
                    when {
                        expression {
                            return params.PUBLISH_RELEASE == false
                        }
                    }
                    steps {
                        script {
                            withNPM(npmrcConfig: 'jenkins-noscope-artifactory-npmrc') {
                                if (BRANCH == "develop") {
                                    echo " On branch develop, publishing with dev tag"
                                    sh "npm run dev-publish"
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('Release') {
            agent {
                docker {
                    image "${NODEJS_IMAGE}"
                    reuseNode true
                    args "-v ${CACHE_VOL} " +
                         "-v /home/jenkins/.ssh:/home/jenkins/.ssh:ro "
                }
            }
            stages {
                stage('Release to npm') {
                    when {
                        expression {
                            return params.PUBLISH_RELEASE
                        }
                    }
                    steps {
                        withNPM(npmrcConfig: 'jenkins-npmjs-npmrc') {
                            sh "npm publish"
                        }
                    }
                }
                stage('Sanitize for public branch') {
                    when {
                        expression {
                            return params.GIT_RELEASE
                        }
                    }
                    steps {
                        sh "sed -i -e 's/Current version.*\$/Current version: ${params.RELEASE_VERSION}/g' ./README.md"
                        sh "sed -i -e 's/CLOVER_CLOUD_SDK_VERSION.*\"/CLOVER_CLOUD_SDK_VERSION = \"${params.RELEASE_VERSION}\"/g' src/com/clover/Version.ts"
                        sh "git rm -rf ./Jenkinsfile"
                        sh "git rm -rf ./.npmrc"
                        sh "git add ."
                        sh "git commit -m \"Release ${params.RELEASE_VERSION} prep\""
                    }
                }
                stage('Generate docs') {
                    when {
                        expression {
                            return params.GIT_RELEASE
                        }
                    }
                    steps {
                        sh "mkdir ${env.WORKSPACE}@tmp/temp-docs"
                        //sh "node ./node_modules/.bin/jsdoc --readme ./README.md -c ./scripts/conf.json -d ${env.WORKSPACE}@tmp/temp-docs"
                        sh "node ./node_modules/gulp/bin/gulp typedoc"
                        sh "cp -a ${env.WORKSPACE}/docs/* ${env.WORKSPACE}@tmp/temp-docs"
                    }
                }
                stage('Create public release branch') {
                    when {
                        expression {
                            return params.GIT_RELEASE
                        }
                    }
                    steps {
                        sshagent(['isvgithub_public']) {
                            // add public remote
                            sh "git remote add public ${params.PUBLIC_REMOTE}"
                            // checkout public develop <- DETACHED HEAD
                            sh "git fetch public"
                            sh "git checkout public/develop"
                            sh "git reset public/develop --hard"
                            // create public release branch
                            sh "git checkout -b release/p${params.RELEASE_VERSION}"
                            // merge kristalinc release branch , squash and no edit ...
                            sh "git merge ${BRANCH} --squash --no-edit --strategy-option theirs"
                            // sanity build
                            sh "npm run build"
                            // commit it
                            sh "git commit -m \"Release ${params.RELEASE_VERSION}\""
                            // push it
                            sh "git push -u public release/p${params.RELEASE_VERSION}"
                        }
                    }
                }
                stage('Create public gh-pages') {
                    when {
                        expression {
                            return params.GIT_RELEASE
                        }
                    }
                    steps {
                        sshagent(['isvgithub_public']) {
                            sh "git checkout public/gh-pages" // more detached head fun
                            sh "git checkout -b release/gh-pages-${params.RELEASE_VERSION}"
                            sh "mkdir ./${params.RELEASE_VERSION}"
                            sh "cp -a ${env.WORKSPACE}@tmp/temp-docs/* ./${params.RELEASE_VERSION}/."
                            sh "git add ."
                            sh "git commit -m \"Documentation for release ${params.RELEASE_VERSION}\""
                            sh "git push -u public release/gh-pages-${params.RELEASE_VERSION}"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
            dir("${env.WORKSPACE}@tmp") {
                deleteDir()
            }
        }
    }
}
