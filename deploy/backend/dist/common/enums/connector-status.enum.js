"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorStatus = void 0;
var ConnectorStatus;
(function (ConnectorStatus) {
    ConnectorStatus["AVAILABLE"] = "Available";
    ConnectorStatus["PREPARING"] = "Preparing";
    ConnectorStatus["CHARGING"] = "Charging";
    ConnectorStatus["SUSPENDED_EVSE"] = "SuspendedEVSE";
    ConnectorStatus["SUSPENDED_EV"] = "SuspendedEV";
    ConnectorStatus["FINISHING"] = "Finishing";
    ConnectorStatus["RESERVED"] = "Reserved";
    ConnectorStatus["UNAVAILABLE"] = "Unavailable";
    ConnectorStatus["FAULTED"] = "Faulted";
})(ConnectorStatus || (exports.ConnectorStatus = ConnectorStatus = {}));
//# sourceMappingURL=connector-status.enum.js.map