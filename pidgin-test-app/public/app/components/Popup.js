import React from 'react';


export default class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayed: true,
            message: '',
            fadeBackground: false
        };
        this.closeCallback = this.closeCallback.bind(this);
        this.fadeBackground = this.fadeBackground.bind(this);
        this.unfadeBackground = this.unfadeBackground.bind(this);
        this.unfadeBackground = this.unfadeBackground.bind(this);
        this.setMessage = this.setMessage.bind(this);
    }

    closeCallback() {
            this.setState({fadeBackground: false, displayed: false});
            this.props.closeCallback();
    }

    setMessage(msg) {
        this.setState({message: msg});
    }

    fadeBackground(){       // fades background for popup
        this.setState({ fadeBackground: true });
    }

    unfadeBackground(){     // unfades background
        this.setState({ fadeBackground: false });
    }

    render () {
        let popup;
        if (this.state.displayed) {
            popup = (<span id="popup">
                <div className={this.state.fadeBackground ? 'popup_full_opaque' : ''}/>
                <div className={"popup popup_container"}>
                    <div className="close_popup" onClick={this.closeCallback}>X</div>
                    <div className="pairing_code">{this.props.message}</div>
                </div>
            </span>);
        } else {
            popup = null;
        }

        return (popup);
    }
}
