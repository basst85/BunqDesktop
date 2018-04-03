import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import Grid from "material-ui/Grid";
import Divider from "material-ui/Divider";
import IconButton from "material-ui/IconButton";
import TextField from "material-ui/TextField";
import { LinearProgress } from "material-ui/Progress";
import List, { ListItemSecondaryAction, ListSubheader } from "material-ui/List";

import KeyboardArrowRightIcon from "material-ui-icons/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "material-ui-icons/KeyboardArrowLeft";
import SkipNextIcon from "material-ui-icons/SkipNext";
import SkipPreviousIcon from "material-ui-icons/SkipPrevious";

import BunqMeTabListItem from "./ListItems/BunqMeTabListItem";
import PaymentListItem from "./ListItems/PaymentListItem";
import MasterCardActionListItem from "./ListItems/MasterCardActionListItem";
import RequestResponseListItem from "./ListItems/RequestResponseListItem";
import RequestInquiryListItem from "./ListItems/RequestInquiryListItem";
import ClearBtn from "../Components/FilterComponents/ClearFilter";
import FilterDrawer from "../Components/FilterComponents/FilterDrawer";

import { openSnackbar } from "../Actions/snackbar";
import { bunqMeTabPut } from "../Actions/bunq_me_tab";
import {
    nextPage,
    previousPage,
    setPage,
    setPageSize,
    firstPage
} from "../Actions/pagination";

import { humanReadableDate } from "../Helpers/Utils";
import {
    paymentFilter,
    bunqMeTabsFilter,
    masterCardActionFilter,
    requestInquiryFilter,
    requestResponseFilter
} from "../Helpers/DataFilters";

const styles = {
    button: {
        width: "100%"
    },
    pageField: {
        width: 40
    },
    list: {
        textAlign: "left"
    }
};

class CombinedList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    shouldComponentUpdate(nextProps) {
        const isCurrentlyLoading =
            this.props.bunqMeTabsLoading ||
            this.props.paymentsLoading ||
            this.props.requestResponsesLoading ||
            this.props.requestInquiriesLoading ||
            this.props.masterCardActionsLoading;
        const willBeLoading =
            nextProps.bunqMeTabsLoading ||
            nextProps.paymentsLoading ||
            nextProps.requestResponsesLoading ||
            nextProps.requestInquiriesLoading ||
            nextProps.masterCardActionsLoading;

        // don't update the components if we are loading now and will be loading in the next update
        if (isCurrentlyLoading && willBeLoading) return false;

        return true;
    }

    copiedValue = type => callback => {
        this.props.openSnackbar(`Copied ${type} to your clipboard`);
    };

    paymentMapper = () => {
        return this.props.payments
            .filter(
                paymentFilter({
                    paymentVisibility: this.props.paymentVisibility,
                    paymentType: this.props.paymentType,
                    dateFromFilter: this.props.dateFromFilter,
                    dateToFilter: this.props.dateToFilter
                })
            )
            .map(payment => {
                return {
                    component: (
                        <PaymentListItem
                            payment={payment.Payment}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: payment.Payment.created,
                    info: payment.Payment
                };
            });
    };

    bunqMeTabsMapper = () => {
        return this.props.bunqMeTabs
            .filter(
                bunqMeTabsFilter({
                    bunqMeTabVisibility: this.props.bunqMeTabVisibility,
                    bunqMeTabType: this.props.bunqMeTabType,
                    dateFromFilter: this.props.dateFromFilter,
                    dateToFilter: this.props.dateToFilter
                })
            )
            .map(bunqMeTab => {
                return {
                    component: (
                        <BunqMeTabListItem
                            bunqMeTab={bunqMeTab.BunqMeTab}
                            BunqJSClient={this.props.BunqJSClient}
                            copiedValue={this.copiedValue}
                            bunqMeTabLoading={this.props.bunqMeTabLoading}
                            bunqMeTabsLoading={this.props.bunqMeTabsLoading}
                            bunqMeTabPut={this.props.bunqMeTabPut}
                            user={this.props.user}
                        />
                    ),
                    filterDate: bunqMeTab.BunqMeTab.updated,
                    info: bunqMeTab.BunqMeTab
                };
            });
    };

    masterCardActionMapper = () => {
        return this.props.masterCardActions
            .filter(
                masterCardActionFilter({
                    paymentVisibility: this.props.paymentVisibility,
                    paymentType: this.props.paymentType,
                    dateFromFilter: this.props.dateFromFilter,
                    dateToFilter: this.props.dateToFilter
                })
            )
            .map(masterCardAction => {
                return {
                    component: (
                        <MasterCardActionListItem
                            masterCardAction={masterCardAction.MasterCardAction}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: masterCardAction.MasterCardAction.updated,
                    info: masterCardAction.MasterCardAction
                };
            });
    };

    requestResponseMapper = () => {
        return this.props.requestResponses
            .filter(
                requestResponseFilter({
                    requestVisibility: this.props.requestVisibility,
                    requestType: this.props.requestType,
                    dateFromFilter: this.props.dateFromFilter,
                    dateToFilter: this.props.dateToFilter
                })
            )
            .map(requestResponse => {
                return {
                    component: (
                        <RequestResponseListItem
                            requestResponse={requestResponse.RequestResponse}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: requestResponse.RequestResponse.created,
                    info: requestResponse.RequestResponse
                };
            });
    };

    requestInquiryMapper = () => {
        return this.props.requestInquiries
            .filter(
                requestInquiryFilter({
                    requestVisibility: this.props.requestVisibility,
                    requestType: this.props.requestType,
                    dateFromFilter: this.props.dateFromFilter,
                    dateToFilter: this.props.dateToFilter
                })
            )
            .map(requestInquiry => {
                return {
                    component: (
                        <RequestInquiryListItem
                            requestInquiry={requestInquiry.RequestInquiry}
                            BunqJSClient={this.props.BunqJSClient}
                        />
                    ),
                    filterDate: requestInquiry.RequestInquiry.created,
                    info: requestInquiry.RequestInquiry
                };
            });
    };

    lastPage = page => () => {
        this.props.setPage(page);
    };
    setPage = pageCount => event => {
        let page = event.target.value - 1;
        pageCount = pageCount - 1;

        if (page < 0) page = 0;
        if (page > pageCount) page = pageCount;

        this.props.setPage(page);
    };

    render() {
        const { page, pageSize, t } = this.props;
        let loadingContent =
            this.props.bunqMeTabsLoading ||
            this.props.paymentsLoading ||
            this.props.requestResponsesLoading ||
            this.props.requestInquiriesLoading ||
            this.props.masterCardActionsLoading ? (
                <LinearProgress />
            ) : (
                <Divider />
            );

        // create arrays of the different endpoint types
        const bunqMeTabs = this.bunqMeTabsMapper();
        const payments = this.paymentMapper();
        const masterCardActions = this.masterCardActionMapper();
        const requestResponses = this.requestResponseMapper();
        const requestInquiries = this.requestInquiryMapper();

        let groupedItems = {};

        // combine the list, order by date and group by day
        const events = [
            ...bunqMeTabs,
            ...requestResponses,
            ...masterCardActions,
            ...requestInquiries,
            ...payments
        ].sort(function(a, b) {
            return new Date(b.filterDate) - new Date(a.filterDate);
        });

        const pageCount = Math.ceil(events.length / pageSize);
        const slicedEvents = events.slice(
            page * pageSize,
            (page + 1) * pageSize
        );

        slicedEvents.map(item => {
            const dateFull = new Date(item.filterDate);
            const date = new Date(
                dateFull.getFullYear(),
                dateFull.getMonth(),
                dateFull.getDate(),
                0,
                0,
                0
            );
            if (!groupedItems[date.getTime()]) {
                groupedItems[date.getTime()] = {
                    date: dateFull,
                    components: []
                };
            }

            // add item to this date group
            groupedItems[date.getTime()].components.push(item.component);
        });

        const combinedComponentList = [];
        Object.keys(groupedItems).map(dateLabel => {
            const groupedItem = groupedItems[dateLabel];

            // get the human readable text for this date group
            const groupTitleText = humanReadableDate(
                parseFloat(dateLabel),
                false
            );

            // add a header component for this date
            combinedComponentList.push([
                <ListSubheader>{groupTitleText}</ListSubheader>,
                <Divider />
            ]);

            // add the components to the list
            return groupedItem.components.map(component =>
                combinedComponentList.push(component)
            );
        });

        return (
            <List style={styles.left}>
                <ListSubheader>
                    {t("Payments and requests")}
                    <ListItemSecondaryAction>
                        <ClearBtn />
                        <FilterDrawer />
                    </ListItemSecondaryAction>
                </ListSubheader>

                <ListSubheader>
                    <Grid container>
                        <Grid item xs={2} sm={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.firstPage}
                                disabled={page === 0}
                            >
                                <SkipPreviousIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={2} sm={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.previousPage}
                                disabled={page === 0}
                            >
                                <KeyboardArrowLeftIcon />
                            </IconButton>
                        </Grid>

                        <Grid
                            item
                            xs={4}
                            sm={8}
                            style={{ textAlign: "center" }}
                        >
                            {t("Page")}{" "}
                            <TextField
                                style={styles.pageField}
                                value={page + 1}
                                type={"number"}
                                inputProps={{
                                    min: 1,
                                    max: pageCount,
                                    step: 1
                                }}
                                onChange={this.setPage(pageCount)}
                            />
                            / {pageCount}
                        </Grid>

                        <Grid item xs={2} sm={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.props.nextPage}
                                disabled={slicedEvents.length < pageSize}
                            >
                                <KeyboardArrowRightIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={2} sm={1}>
                            <IconButton
                                style={styles.button}
                                onClick={this.lastPage(pageCount - 1)}
                                disabled={slicedEvents.length < pageSize}
                            >
                                <SkipNextIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </ListSubheader>

                {loadingContent}
                {combinedComponentList}
            </List>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user.user,
        accountsAccountId: state.accounts.selectedAccount,

        page: state.pagination.page,
        pageSize: state.pagination.page_size,

        paymentType: state.payment_filter.type,
        paymentVisibility: state.payment_filter.visible,
        bunqMeTabType: state.bunq_me_tab_filter.type,
        bunqMeTabVisibility: state.bunq_me_tab_filter.visible,
        requestType: state.request_filter.type,
        requestVisibility: state.request_filter.visible,
        dateFromFilter: state.date_filter.from_date,
        dateToFilter: state.date_filter.to_date,

        bunqMeTabs: state.bunq_me_tabs.bunq_me_tabs,
        bunqMeTabsLoading: state.bunq_me_tabs.loading,
        bunqMeTabLoading: state.bunq_me_tab.loading,

        masterCardActions: state.master_card_actions.master_card_actions,
        masterCardActionsLoading: state.master_card_actions.loading,

        requestInquiries: state.request_inquiries.request_inquiries,
        requestInquiriesLoading: state.request_inquiries.loading,

        requestResponses: state.request_responses.request_responses,
        requestResponsesLoading: state.request_responses.loading,

        payments: state.payments.payments,
        paymentsLoading: state.payments.loading
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { BunqJSClient } = ownProps;
    return {
        openSnackbar: message => dispatch(openSnackbar(message)),
        bunqMeTabPut: (userId, accountId, tabId, status) =>
            dispatch(
                bunqMeTabPut(BunqJSClient, userId, accountId, tabId, status)
            ),
        firstPage: () => dispatch(firstPage()),
        nextPage: () => dispatch(nextPage()),
        previousPage: () => dispatch(previousPage()),
        setPageSize: size => dispatch(setPageSize(size)),
        setPage: page => dispatch(setPage(page))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(
    translate("translations")(CombinedList)
);
