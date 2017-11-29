import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";

export default class ResultsGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {
                context: {
                    componentParent: this
                }
            },
            columnDefs: ResultsGrid.createColumnDefs(),
            getNodeChildDetails: function getNodeChildDetails(rowItem) {
                if (rowItem.before || rowItem.after) {
                    rowItem.beforeAndAfters = rowItem.beforeAndAfters || [];
                    if (rowItem.beforeAndAfters.length === 0) {
                        //Don't reinitialize
                        if (rowItem.before) {
                            rowItem.before.forEach(beforeTest => {
                                beforeTest.name += "(before)";
                            });
                            rowItem.beforeAndAfters = rowItem.beforeAndAfters.concat(rowItem.before);
                        }
                        if (rowItem.after) {
                            rowItem.after.forEach(afterTest => {
                                afterTest.name += "(after)";
                            });
                            rowItem.beforeAndAfters = rowItem.beforeAndAfters.concat(rowItem.after);
                        }
                    }

                    return {
                        group: true,
                        expanded: true,
                        children: rowItem.beforeAndAfters,
                        key: rowItem.name
                    };
                } else if (rowItem.testActions) {
                    return {
                        group: true,
                        expanded: true,
                        children: rowItem.testActions,
                        key: rowItem.name
                    };
                } else {
                    return null;
                }
            }
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    static createColumnDefs() {

        return [
            {
                headerName: "Name",
                field: "name",
                cellRenderer: "group",
                width: 100,
                cellRendererParams: {
                    padding: 10
                }
            },
            {
                headerName: "Pass",
                field: "result.pass",
                width: 60,
                cellStyle: function(params) {
                    if (params.value) {
                        return {color: 'black', backgroundColor: 'green'};
                    } else if (params.value === false) {
                        return {color: 'black', backgroundColor: 'red'};
                    }
                }
            },
            {
                headerName: "Message",
                field: "result.message"
            }
        ];
    }

    render() {
        return (
            <div style={{height: 400, width: "100%"}} className="ag-fresh">
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}
                    gridOptions={this.state.gridOptions}
                    getNodeChildDetails={this.state.getNodeChildDetails}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};