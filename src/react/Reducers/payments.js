import store from "store";
import MergeApiObjects from "../Helpers/MergeApiObjects";

import { STORED_PAYMENTS } from "../Actions/payments";

export const defaultState = {
    payments: [],
    account_id: false,
    loading: false,
    newer_ids: [],
    older_ids: []
};

export default (state = defaultState, action) => {
    let payments = [...state.payments];

    switch (action.type) {
        case "PAYMENTS_UPDATE_INFO":
        case "PAYMENTS_SET_INFO":
            const ignoreOldItems = false;

            const mergedInfo = MergeApiObjects(
                action.payload.account_id,
                action.payload.payments,
                ignoreOldItems ? [] : payments
            );
            const mergedPayments = mergedInfo.items;

            // store the data if we have access to the bunqjsclient
            if (action.payload.BunqJSClient) {
                action.payload.BunqJSClient.Session.storeEncryptedData(
                    {
                        items: mergedPayments,
                        account_id: action.payload.account_id
                    },
                    STORED_PAYMENTS
                )
                    .then(() => {})
                    .catch(() => {});
            }

            // update newer and older id for this monetary account
            const newerIds = {
                ...state.newer_ids,
                [action.payload.account_id]: mergedInfo.newer_id
            };
            const olderIds = {
                ...state.older_ids,
                [action.payload.account_id]: mergedInfo.older_id
            };

            return {
                ...state,
                payments: mergedPayments,
                account_id: action.payload.account_id,
                newer_ids: newerIds,
                older_ids: olderIds
            };

        case "ACCOUNTS_SELECT_ACCOUNT":
            return {
                ...state
            };

        case "PAYMENTS_IS_LOADING":
            return {
                ...state,
                loading: true
            };

        case "PAYMENTS_IS_NOT_LOADING":
            return {
                ...state,
                loading: false
            };

        case "PAYMENTS_CLEAR":
        case "REGISTRATION_LOG_OUT":
        case "REGISTRATION_CLEAR_PRIVATE_DATA":
        case "REGISTRATION_CLEAR_USER_INFO":
            store.remove(STORED_PAYMENTS);
            return {
                payments: [],
                account_id: false,
                loading: false
            };
    }
    return state;
};
