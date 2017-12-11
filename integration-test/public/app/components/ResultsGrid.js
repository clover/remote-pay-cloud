import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import * as ActionStatus from "../../test-engine/ActionStatus";

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
                        // Don't reinitialize
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

    componentDidUpdate(prevProps, prevState) {
        if (this.gridApi) {
            // Update the grid data, only if it changed.
            if (!this.props.rowData.equals(prevProps.rowData)) {
                this.gridApi.setRowData(this.props.rowData.toJS());
            }
        }
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
                headerName: "Status",
                field: "result.status",
                width: 60,
                cellRenderer: (params) => {
                    if (params.value === ActionStatus.get().pass) {
                        return `<span class="text-success"><b>${params.value}</b></span>`;
                    } else if (params.value === ActionStatus.get().fail) {
                        return `<span class="text-danger"><b>${params.value}</b></span>`;
                    } else if (params.value === ActionStatus.get().manual) {
                        return `<span class="text-warning"><b>${params.value}</b></span>`;
                    } else if (params.value === ActionStatus.get().executing) {
                        return `<span class="text-info"><b>... ${params.value}</b></span>`;
                    } else {
                        return `<span></span>`;
                    }
                }
            },
            {
                headerName: "Messages",
                field: "result.messages",
                cellRenderer: (params) => {
                    if (params.value) {
                        return `<span>${params.value.join(",")}</span>`
                    }
                }
            }
        ];
    }

    render() {
        return (
            <div style={{height: 500, width: "100%"}} className="ag-fresh">
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData.toJS()}
                    gridOptions={this.state.gridOptions}
                    getNodeChildDetails={this.state.getNodeChildDetails}
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};