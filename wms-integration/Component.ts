import { } from "./extensions/extensions";
import BaseComponent from "sap/ui/core/UIComponent";
import RestService from "./rest/RestService";
import Event from "sap/ui/base/Event";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Filter from "sap/ui/model/Filter";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import { ODataListBindingFilter } from "./model/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import { B1User, EmployeesInfo, Permission, PermissionNum } from "./model/User";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { WMSPermissions } from "./model/Permission";
import { WMSLicenses } from "./model/License";
import Log, { Level } from "sap/base/Log";
import MessageBox from "sap/m/MessageBox";
import { DeviceSettings, DeviceSettingsFontSize } from "./model/ScannerSettings";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import ComponentSettings from "./model/ComponentSettings";
import WebSocket from "sap/ui/core/ws/WebSocket";
import NotificationService from "./m/NotificationService";
import { WebSocketMessage, WebSocketMessageType } from "./model/WebsocketMessage";
import PickListDetails from "./controller/PickListDetails.controller";
import { InboxItem } from "./model/InboxItem";
import { ODataListResponse } from "./model/ODataListResponse";
import Button from "sap/m/Button";
import BadgeCustomData from "sap/m/BadgeCustomData";
import { CORE_SCRIPT, WMS_SCRIPT } from "./model/WMS_SCRIPT";
import ScriptService from "./m/ScriptService";
import Input from "./m/Input";
import FilterOperator from "sap/ui/model/FilterOperator";
import SearchField from "./m/SearchField";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import { ValueHelpParameters } from "./model/ValueHelpParameters";
import Table from "sap/m/Table";
import Context from "sap/ui/model/Context";
import Token from "sap/m/Token";
import UIColumn from "sap/ui/table/Column";
import MColumn from "sap/m/Column";
import Text from "sap/m/Text";
import Label from "sap/m/Label";
import ColumnListItem from "sap/m/ColumnListItem";
import Notifications from "./controller/Notifications.controller";
import CrystalReportsService from "./m/CrystalReportsService";
import { SessionInformation } from "./model/SessionInformation";
import { Warehouse } from "./model/Warehouses";
import { B1Item } from "./model/Items";
import { BinLocation } from "./model/BinLocations";
import { B1AdminInfo } from "./model/B1AdminInfo";
import Controller from "sap/ui/core/mvc/Controller";
import { BatchParameters, BatchParametersTypeENUM } from "./rest/BatchParameters";
import * as $ from 'jquery';
import LogService from "./m/LogService";
import VirtualThemeManager from "./m/VirtualThemeManager";
import BaseService from "./services/BaseService";
import ODBCService from "./services/ODBCService";

export interface ExtraColumn {
    label: string,
    text: PropertyBindingInfo | string,
    property: string,
    expand?: string,
    getValidValues?: Promise<any>,
    validValues?: Array<any>,
    visible?: boolean,
    icon?: PropertyBindingInfo | string,
    state?: PropertyBindingInfo | string
}


/**
 * @namespace ntt.wms
 */
export default class Component extends BaseComponent {

    private useComplexBarcodes = true;
    private useSpeechAPI = true;
    private barcodeFieldValidation = '[a-zA-Z0-9_.-]*';
    private barcodeRegex = /(?<Field>{(?<Name>[^}]*)})/gm;

    private _userSettings: any;
    private oWebSocket: WebSocket;
    private oNotificationService: NotificationService;
    private oCrystalReportService: CrystalReportsService;

    private _adminInfo: B1AdminInfo;
    private _moduleSettings: ComponentSettings;
    private _mainModuleSettings: any;
    private _user: B1User;
    private _session: SessionInformation;

    private _scripts: { [name: string]: ScriptService } = {};
    private _i18nBundle: ResourceBundle | Promise<ResourceBundle>;

    private _warehouses: Array<Warehouse>;
    private _binLocations: Array<BinLocation>;

    private _wsReconnect = 0;
    private readonly _wsReconnectTry = 5;

    private _logService: LogService;

    private _companyDB: string = "";

    private _registeredServices: { [key: string]: BaseService | undefined } = {};


    public static metadata = {
        manifest: "json"
    };

    private restService: RestService
    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    public init(): void {

        this.restService = new RestService({
            baseUrl: "/b1s/v2",
            urlParameters: {}
        });

        // call the base component's init function
        super.init();

        (Component as any).getMainComponent = () => {
            return this;
        };

        this._i18nBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle();

        this.getDeviceSettings();

        VirtualThemeManager.getInstance().applyDefault();

        this.initCompany().then( oUser => {
            this.getRouter().initialize();

        }).catch((err: any) => {
            MessageBox.error(err.message);
        });
    }

    public getLogService() {
        return this._logService;
    }

    public async getAboutInformation() {
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

        var wmsVersion = this.getManifestEntry("/sap.app/applicationVersion/version");
        var ui5Version = (sap.ui as any).version as string;

        var device = `${sap.ui.Device.os.name} ${sap.ui.Device.os.version}`;
        var browser = `${sap.ui.Device.browser.name} ${sap.ui.Device.browser.version}`;

        var session = await this.getSessionInfo();
        var logsCount = await this._logService.getPendingLogs();



        return `Felhasználó: ${session.SessionInfo.User}\r\nAdatbázis: ${session.SessionInfo.Company}\r\n\r\nWMS verzió: ${wmsVersion}\r\nUI5 verzió: ${ui5Version}\r\n\r\nEszköz: ${device}\r\nBöngésző: ${browser}\r\nFelbontás: ${width}*${height}\r\n\r\nFeltöltendő log bejegyzések: ${logsCount}`
    }

    public getCompanyDB() {
        return this._session.SessionInfo.Company;
    }

    public async initCompany() {

        try {

            let sessionInfo = await this.getSessionInfo(true);

            this._logService = new LogService(this);
            this._logService.initLogService();

            Log.info("Company init", "", "WMS");
            Log.info("Device setting", JSON.stringify(this.getDeviceSettings()), "WMS");

            if (this.useBatchRequests()) {
                await this.getSessionInfoBatch();
            }

            let oUser = await this.getCurrentUser(!this.useBatchRequests());
            let _settings = await this.getModuleSettings(!this.useBatchRequests());
            let _mainSettings = await this.getMainModuleSettings(!this.useBatchRequests());

            let aBatchData: Array<BatchParameters> | undefined;

            if (this.useBatchRequests()) {

                aBatchData = new Array<BatchParameters>();

                let aPermissions = ["ITCORE_WMS", "ITCORE_WMSADM", "ITCORE_WMS_OWTR", "ITCORE_WMS_OIGE", "ITCORE_WMS_OIGN",
                    "ITCORE_WMS_ORDN", "ITCORE_WMS_OPDN", "ITCORE_WMS_ODLN", "ITCORE_WMS_OINV", "ITCORE_WMS_PICK", "ITCORE_WMS_OWOR",
                    "ITCORE_WMS_OWTQ", "ITCORE_WMS_OINC"];

                let userCode = (await (this.getCurrentUser())).UserCode;

                aPermissions.forEach(perm => {
                    aBatchData?.push({
                        url: "/SBOBobService_GetSystemPermission",
                        type: BatchParametersTypeENUM.POST,
                        data: {
                            PermissionID: perm,
                            UserCode: userCode
                        }
                    })
                });
await this.registerService("ODBCService", new ODBCService());
                aBatchData = await this.getRestService().BATCHRequest(aBatchData, false);
            }

            let oPermissions: WMSPermissions = {
                ITCORE_WMS: await this.getPermission("ITCORE_WMS", aBatchData),
                ITCORE_WMSADM: await this.getPermission("ITCORE_WMSADM", aBatchData),
                ITCORE_WMS_OWTR: await this.getPermission("ITCORE_WMS_OWTR", aBatchData),
                ITCORE_WMS_OIGE: await this.getPermission("ITCORE_WMS_OIGE", aBatchData),
                ITCORE_WMS_OIGN: await this.getPermission("ITCORE_WMS_OIGN", aBatchData),
                ITCORE_WMS_ORDN: await this.getPermission("ITCORE_WMS_ORDN", aBatchData),
                ITCORE_WMS_OPDN: await this.getPermission("ITCORE_WMS_OPDN", aBatchData),
                ITCORE_WMS_ODLN: await this.getPermission("ITCORE_WMS_ODLN", aBatchData),
                ITCORE_WMS_OINV: await this.getPermission("ITCORE_WMS_OINV", aBatchData),
                ITCORE_WMS_PICK: await this.getPermission("ITCORE_WMS_PICK", aBatchData),
                ITCORE_WMS_OWOR: await this.getPermission("ITCORE_WMS_OWOR", aBatchData),
                ITCORE_WMS_OWTQ: await this.getPermission("ITCORE_WMS_OWTQ", aBatchData),
                ITCORE_WMS_OINC: await this.getPermission("ITCORE_WMS_OINC", aBatchData),
                //ITCORE_WMS_DRIVER: await this.getPermission("ITCORE_WMS_DRIVER", aBatchData),
            };

            let oLicenses = await this.getLicenseData();

            let aPermissionProperties = Object.getOwnPropertyNames(oPermissions);

            for (let i = 0; i < aPermissionProperties.length; i++) {
                let sProp = aPermissionProperties[i];
                if ((oPermissions as any)[sProp]) {
                    let pProp = sProp.replace("ITCORE_", "");
                    if (!(oLicenses as any)[pProp]) {
                        (oPermissions as any)[sProp] = false;
                        Log.warning(`Nincs licensz: ${(await this.geti18nResourceBundle()).getText(pProp)}`);
                    } else {
                        try {
                            let oLicenseDate = new Date((oLicenses as any)[pProp]);
                            if (oLicenseDate < new Date()) {
                                MessageBox.warning(`Licensz lejárt: ${(await this.geti18nResourceBundle()).getText(pProp)} `, {
                                    details: `${oLicenseDate.toISOString().substring(0, 10)}`
                                });
                                (oPermissions as any)[sProp] = false;
                            }
                        } catch (err: any) {
                            (oPermissions as any)[sProp] = false;
                            Log.error(err.message);
                        }
                    }
                }

            }

            Log.info("Permissions", JSON.stringify(oPermissions), "WMS");
            let oPermModel = new JSONModel(oPermissions);
            oPermModel.setDefaultBindingMode("OneTime");

            this.setModel(oPermModel, "permissions");

            try {
                this._userSettings = await this.restService.requestGET(`/CORE_USER_SETTINGS('${oUser.UserCode}')`);
            }
            catch (er: any) {
                this._userSettings = await this.restService.requestPOST(`/CORE_USER_SETTINGS`, { "Code": oUser.UserCode });
            }

            this._adminInfo = await this.restService.requestGET("/CompanyService_GetAdminInfo");

            await this.preloadScripts();

            if (this.getRouter().getHashChanger().getHash() == "Login")
                this.getRouter().navTo("RouteMain");

            this.initWebsocket();

            this.oNotificationService = new NotificationService(this);
            this.oNotificationService.registerPush();

            this.oCrystalReportService = new CrystalReportsService(this, _mainSettings);

            await this.setAlertManager();

            Log.info("Information", await this.getAboutInformation(), "WMS");

            this._logService.uploadLogs();

            return oUser;
        }
        catch (err: any) {

            this.eraseCookie("B1SESSION");
            (this._user as any) = undefined;

            if (err.message && err.message.toLowerCase().startsWith("invalid session")) {
                this.getRouter().navTo("RouteLogin");
            } else {
                this.getRouter().navTo("RouteLogin");
                throw err;
            }
        } finally {
        }

    }

    private getPrinterServer() {
        let _settings = this.getDeviceSettings();
        return _settings.printerServer || "/wms";
    }

    public async checkPrinterServer() {
        try {
            let _printerServer = this.getPrinterServer();
            let _resp = await new RestService({ baseUrl: _printerServer }).requestGET("/check") as any;

            if (!_resp.wmsVersion)
                throw new Error("Nem sikerült csatlakozni a nyomtató kiszolgálóhoz!");

            return true;
        }
        catch (err: any) {
            throw new Error(err.message || "Nem sikerült csatlakozni a nyomtató kiszolgálóhoz!")
        }
    }

    public async getWarehouses(bForceRefresh = false) {
        if (bForceRefresh)
            this._warehouses = await this.getRestService().requestGETALL("/Warehouses?$orderby=WarehouseCode");
        else
            this._warehouses = this._warehouses || await this.getRestService().requestGETALL("/Warehouses?$orderby=WarehouseCode");

        return this._warehouses;
    }

    private async getBinLocationsBatch() {
        let aBinLocations: Array<BinLocation> = [];

        let binCount = await this.getRestService().requestGET("/BinLocations?$select=BinCode&$top=1&$count=true") as ODataListResponse<BinLocation>;

        if (!(binCount["@count"] || binCount["@odata.count"] as number)) {
            return aBinLocations;
        }

        let aBatchData = new Array<BatchParameters>();
        for (let i = 0; i < (binCount["@count"] || binCount["@odata.count"] as number); i = i + 20) {
            aBatchData.push({
                type: BatchParametersTypeENUM.GET,
                url: i > 0 ? `/BinLocations?$orderby=Warehouse,BinCode&$top=20&$skip=${i}` : `/BinLocations?$orderby=Warehouse,BinCode&$top=20`
            });
        }

        let aBatchResponse = await this.getRestService().BATCHRequest(aBatchData, false);

        aBatchResponse.forEach(resp => {
            (resp.response?.data as ODataListResponse<BinLocation>).value.forEach(bin => {
                aBinLocations.push(bin);
            })
        })

        return aBinLocations;
    }

    public async getBinLocations(bForceRefresh = false) {

        try {
            let _binLocationsCache = await fetch("./binlocations.json");
            this._binLocations = await _binLocationsCache.json();

            return this._binLocations;
        } catch { }


        if (this.getDeviceSettings().batchRequests) {

            if (bForceRefresh)
                this._binLocations = await this.getBinLocationsBatch();
            else
                this._binLocations = this._binLocations || await this.getBinLocationsBatch();

        } else {

            if (bForceRefresh)
                this._binLocations = await this.getRestService().requestGETALL("/BinLocations?$orderby=Warehouse,BinCode");
            else
                this._binLocations = this._binLocations || await this.getRestService().requestGETALL("/BinLocations?$orderby=Warehouse,BinCode");
        }
        return this._binLocations;
    }

    public async getPrinters() {
        let _printerServer = this.getPrinterServer();
        return await new RestService({ baseUrl: _printerServer }).requestGET("/printers") as Array<string>;
    }

    public async printToServer(printer: string, data: string) {
        let _printerServer = this.getPrinterServer();
        return await new RestService({ baseUrl: _printerServer }).requestPOST("/print", {
            data: data,
            printer: printer
        });
    }

    public async printToServerUTF8(printer: string, data: string) {
        let _printerServer = this.getPrinterServer();
        return await new RestService({ baseUrl: _printerServer }).requestPOST("/printutf8", {
            data: data,
            printer: printer
        });
    }

    public async printBlob(blob: Blob | string) {
        return new Promise<void>((resolve, reject) => {
            try {
                if (blob instanceof Blob) {
                    var objectURL = URL.createObjectURL(blob);

                    // @ts-ignore
                    printJS({ printable: objectURL, type: "pdf" });

                    resolve();

                } else {

                    let iframe = document.createElement("iframe");
                    iframe.style.display = 'none';

                    document.body.appendChild(iframe);

                    let printWindow = iframe.contentWindow as Window;
                    printWindow.document.open('text/plain')
                    printWindow.document.write(blob);
                    printWindow.document.close();

                    setTimeout(() => {
                        printWindow?.print();
                        iframe.remove();
                        resolve();
                    }, 500);
                }
            } catch (err: any) {
                reject(err);
            }
        })
    }

    public getDefaultBinLocation(aBinLocations: Array<BinLocation>, oWhs: Warehouse, oItem?: B1Item) {

        if (oItem && oItem.ItemWarehouseInfoCollection) {
            let oItemWarehouseInfo = oItem.ItemWarehouseInfoCollection.find(c => oWhs.WarehouseCode);
            if (oItemWarehouseInfo) {
                let oBin = aBinLocations.find(b => b.AbsEntry == oItemWarehouseInfo?.DefaultBin)
                if (oBin)
                    return oBin;
            }
        }

        if (this._moduleSettings.WHS_BINLOCATION) {
            let oBin = aBinLocations.find(b => b.BinCode == (oWhs as any)[this._moduleSettings.WHS_BINLOCATION]);
            if (oBin)
                return oBin;
        }

        return aBinLocations.find(b => b.AbsEntry == oWhs.DefaultBin);
    }

    public getAdminInfo() {
        return this._adminInfo;
    }

    private initWebsocket() {

        let wsUrl = window.location.hostname + (window.location.port ? `:${window.location.port}` : '') + window.location.pathname;
        var fileName = wsUrl.split('/').pop() as string;
        wsUrl = wsUrl.substring(0, wsUrl.length - (fileName.length || 0));

        if (!wsUrl.endsWith("/"))
            wsUrl += "/";

        // DEBUG
        if (window.location.port == "8083")
            wsUrl = "localhost/SAPB1/"

        let _wsProtocol = window.location.protocol.startsWith("https") ? 'wss' : 'ws';

        this.oWebSocket = new WebSocket(_wsProtocol + '://' + wsUrl + "ws");

        this.oWebSocket.attachOpen(this.onWebSocketOpened.bind(this));
        this.oWebSocket.attachMessage(this.onWebSocketMessage.bind(this));
        this.oWebSocket.attachError(this.onWebSocketError.bind(this));
        this.oWebSocket.attachClose(this.onWebSocketClose.bind(this));

    }

    public createUUID() {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

    }

    public getUserSettings() {
        return this._userSettings;
    }

    public getUserSetting(key: string, def: any = null) {
        let opt = this._userSettings.CORE_USER_SETTINGSLCollection.find((o: any) => o.U_SETTINGS_KEY == key);
        return opt ? opt.U_SETTING : def;
    }

    public async setUserSetting(key: string, val: string) {

        let opt = this._userSettings.CORE_USER_SETTINGSLCollection.find((o: any) => o.U_SETTINGS_KEY == key) || { U_SETTINGS_KEY: key, U_SETTING: val };

        opt.U_SETTING = val;

        await this.restService.requestPATCH(`/CORE_USER_SETTINGS('${this._user.UserCode}')`, {
            "CORE_USER_SETTINGSLCollection": [opt]
        });

        if (!opt.LineId) {
            this._userSettings = await this.restService.requestGET(`/CORE_USER_SETTINGS('${this._user.UserCode}')`);
        }

        return this.getUserSetting(key);
    }

    private async preloadScripts() {

        if (this._moduleSettings.ENABLE_SCRIPT_SERVICE == "Y" && this._moduleSettings.PRELOAD_SCRIPT_SERVICE == "Y") {

            let _scripts = new Array<CORE_SCRIPT>;
            let wmsScripts = await this.restService.requestGETALL(`/WMS_SCRIPTS?$filter=U_ACTIVE eq 'Y'&$orderby=U_ORDER,Code`) as Array<WMS_SCRIPT>;
            let coreScripts = await this.restService.requestGETALL(`/CORE_SCRIPTS`) as Array<CORE_SCRIPT>;

            for (let i = 0; i < wmsScripts.length; i++) {
                let wmsScript = wmsScripts[i];
                try {
                    let coreScript = coreScripts.find(s => s.Code == wmsScript.U_SCRIPT);
                    if (!coreScript)
                        continue;

                    coreScript.WMS_SCRIPT = wmsScript;
                    _scripts.push(coreScript);
                }
                catch (err: any) {
                    Log.error(`Script error! - Code: ${wmsScript?.Code}`, err.message, "getScripts");
                    MessageBox.error(err.message, {
                        title: "Szkript hiba!",
                        details: `Azonosító: ${wmsScript?.Code}`
                    })
                }
            }

            const groups = _scripts.reduce((groups: { [name: string]: Array<CORE_SCRIPT> }, item) => {
                const eventName = item.WMS_SCRIPT?.U_EVENT;
                const group = (groups[eventName] || []);
                group.push(item);
                groups[eventName] = group;
                return groups;
            }, {}) as { [name: string]: Array<CORE_SCRIPT> };

            Object.getOwnPropertyNames(groups).forEach((eventName) => {
                this._scripts[eventName] = new ScriptService(eventName, groups[eventName]);
            })

            Log.info(`Scripts preloaded! - ${_scripts?.length}`, "preloadScripts");
        }

    }

    public async getScripts(group: string, event: string) {
        try {

            let U_EVENT = `${group}_${event}`;

            if (this._moduleSettings.ENABLE_SCRIPT_SERVICE == "Y" && this._moduleSettings.PRELOAD_SCRIPT_SERVICE == "Y") {
                return this._scripts[U_EVENT];
            }

            if (this._moduleSettings.ENABLE_SCRIPT_SERVICE == "Y") {

                if (this._scripts[U_EVENT])
                    return this._scripts[U_EVENT];

                let _scripts = new Array<CORE_SCRIPT>;
                let wmsScripts = await this.restService.requestGETALL(`/WMS_SCRIPTS?$filter=U_EVENT eq '${U_EVENT}' and U_ACTIVE eq 'Y'&$orderby=U_ORDER,Code`) as Array<WMS_SCRIPT>;

                for (let i = 0; i < wmsScripts.length; i++) {
                    let wmsScript = wmsScripts[i];
                    try {
                        let coreScript = await this.restService.requestGET(`/CORE_SCRIPTS('${wmsScript.U_SCRIPT}')`) as CORE_SCRIPT;
                        coreScript.WMS_SCRIPT = wmsScript;
                        _scripts.push(coreScript);
                    }
                    catch (err: any) {
                        Log.error(`Script error! - Code: ${wmsScript?.Code}`, err.message, "getScripts");
                        MessageBox.error(err.message, {
                            title: "Szkript hiba!",
                            details: `Azonosító: ${wmsScript?.Code}`
                        })
                    }
                }

                this._scripts[U_EVENT] = new ScriptService(U_EVENT, _scripts);

                return this._scripts[U_EVENT];
            }

            return undefined;

        } catch (err: any) {
            Log.error(`Script error! - Code: ${group} | ${event}`, err.message, "getScripts");
            throw new Error(err.message);
        }

    }

    public getWebSocket() {
        return this.oWebSocket;
    }

    public sendWebSocketMessageRequest(command: string, data?: any, responseCallback?: Function) {

        let originalMessage = this.sendWebSocketMessage(command, WebSocketMessageType.REQUEST, data);

        let oFn = (oWebsocketEvent: Event) => {
            try {
                var message = JSON.parse(oWebsocketEvent.getParameter('data')) as WebSocketMessage;

                if (message.type == WebSocketMessageType.RESPONSE && originalMessage?.id == message.requestData?.id) {
                    responseCallback?.call(this, message);
                }

                Log.info(`WebSocket - ${message.id}`, "Message received");
            }
            catch (err: any) {
                Log.error("WebSocket Message Error", err.message);
            }
        };

        if (responseCallback)
            this.oWebSocket?.attachMessage(oFn);

        setTimeout(() => {
            this.oWebSocket?.detachMessage(oFn);
        }, 120000);

        return originalMessage;
    }

    public sendWebSocketMessageResponse(originalMessage: WebSocketMessage, data?: any) {
        return this.sendWebSocketMessage(originalMessage.command, WebSocketMessageType.RESPONSE, data, originalMessage);
    }

    private sendWebSocketMessage(command: string, type: WebSocketMessageType, data?: any, originalMessage?: WebSocketMessage) {

        if (this.oWebSocket) {
            try {

                let wsMessage: WebSocketMessage = {
                    id: this.createUUID(),
                    requestData: originalMessage,
                    sender: this._user?.UserName as string,
                    ts: new Date().getTime(),
                    type: type,
                    command: command,
                    data: data
                };

                this.oWebSocket.send(JSON.stringify(wsMessage));

                return wsMessage;
            }
            catch (err: any) {
                Log.error("WebSocket Message Error", err.message);
            }
        }

    }

    public async syncInbox() {
        return await Notifications.getInbox(this);
    }

    private async setAlertManager() {

        let msgModel = new JSONModel({ Alerts: [], lastAlertCode: 0 });
        this.setModel(msgModel, "alerts");

        await this.syncInbox();

        let minutes = 1 //this.getUserSetting('NOTIF_MINUTES', 3);
        if (minutes > 0) {
            setInterval(() => {
                this.syncInbox();
            }, minutes * 60000);
        }

    }

    public getNotificationService() {
        return this.oNotificationService;
    }


    public getCrystalReportService() {
        return this.oCrystalReportService;
    }

    private async onWebSocketOpened(oWebsocketEvent: Event) {
        Log.info("WebSocket", "Connection opened", "WMS");
        this._wsReconnect = 0;
    }

    private onWebSocketMessage(oWebsocketEvent: Event) {
        try {
            let oMessage = JSON.parse(oWebsocketEvent.getParameter('data')) as WebSocketMessage;
            Log.info("WebSocket", "Message received");

            PickListDetails.WebSocketHandler(this, oMessage);
        }
        catch (err: any) {
            Log.error("WebSocket Message Error", err.message, "WMS");
        }
    }

    private onWebSocketError(oWebsocketEvent: Event) {
        Log.error("WebSocket", "Connection failed", "WMS");

        Log.warning("WebSocket", 'Socket error.', "WMS");

        if (this._wsReconnect == this._wsReconnectTry)
            MessageBox.warning("Nem sikerült kapcsolódni az élő kiszolgálóhoz. Ezért bizonyos funkciók nem fognak megfelelően működni!");

        this._wsReconnect = this._wsReconnect + 1;
    }

    private onWebSocketClose(oWebsocketEvent: Event) {
        let wasClean = oWebsocketEvent.getParameter("wasClean");

        Log.warning("WebSocket", 'Socket is closed. Reconnect will be attempted in 5 second.', oWebsocketEvent.getParameter("reason"));

        if (this._wsReconnect <= this._wsReconnectTry)
            setTimeout(() => this.initWebsocket(), 5000);
    }

    private static pad(num: number) {
        var norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    public static toIsoString(dt: Date): string {
        let tzo = -dt.getTimezoneOffset();
        let dif = tzo >= 0 ? '+' : '-';

        return dt.getFullYear() +
            '' + this.pad(dt.getMonth() + 1) +
            '' + this.pad(dt.getDate()) +
            '_' + this.pad(dt.getHours()) +
            '' + this.pad(dt.getMinutes()) +
            '' + this.pad(dt.getSeconds());
    }

    public static convertFileSize(bytes: number, si = false, dp = 1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
    }

    public async ODBCExecute(command: string) {
        const odbRest = new RestService({ baseUrl: "./ODBC" })
        return odbRest.requestPOST('/Execute', {
            Command: command
        });
    }

    private async getPermission(permissionID: string, batchResponse?: BatchParameters[]): Promise<boolean> {

        if (this._user?.Superuser == "tYES")
            return true;

        let oPerm = this._user?.UserPermission?.find(perm => perm.PermissionID == permissionID);

        if (oPerm?.Permission == Permission.boper_Full || oPerm?.Permission == Permission.boper_ReadOnly)
            return true;


        let pParams = {
            PermissionID: permissionID,
            UserCode: (await (this.getCurrentUser())).UserCode
        };

        if (batchResponse) {
            let batchPerm = batchResponse.find(b => b.data?.PermissionID == permissionID && b.response?.data !== undefined);
            if (batchPerm) {
                let iPermission = batchPerm.response?.data as number;

                if (iPermission == PermissionNum.ReadWrite || iPermission == PermissionNum.ReadOnly || iPermission == PermissionNum.VariousAuthorization)
                    return true;

                return false;
            }
        }

        let iPermission = await this.restService.requestPOST("/SBOBobService_GetSystemPermission", pParams) as number;

        if (iPermission == PermissionNum.ReadWrite || iPermission == PermissionNum.ReadOnly || iPermission == PermissionNum.VariousAuthorization)
            return true;


        return false;
    }

    public getPermissions(): WMSPermissions {
        return (this.getModel("permissions") as JSONModel)?.getData() as WMSPermissions;
    }

    public async geti18nResourceBundle(): Promise<ResourceBundle> {
        return new Promise((resolve, reject) => {
            if ((this._i18nBundle as Promise<ResourceBundle>).then) {
                (this._i18nBundle as Promise<ResourceBundle>).then(_resBoundle => {
                    this._i18nBundle = _resBoundle;
                    resolve(_resBoundle);
                })
                return;
            }
            resolve(this._i18nBundle);
        });
    }

    public getDeviceSettings() {

        let defOptions: DeviceSettings = {
            logLevel: 3,
            printerServer: '/wms',
            enableCameraScanner: false,
            enableBluetoothScanner: true,
            handleFocusedElement: false,
            disableKeyboardOnMobile: true,
            triggerOneTime: false,
            replaceGS1Separator: false,
            GS1FunctionKey: "altKey",
            GS1Code: undefined,
            GS1ReplacementCharacter: undefined,
            scanningMode: "TimeInterval",
            intervalForDetection: 30,
            prefix: "$",
            suffix: "#",
            maxPrefixSuffixScanningTime: 5000,
            fontSize: DeviceSettingsFontSize.Normal,
            batchRequests: true
        };

        let sSett = localStorage.getItem("scannerSettings");
        if (sSett) {
            try { defOptions = JSON.parse(sSett) }
            catch { }
        }

        let iLevel = defOptions.logLevel;
        if (iLevel === undefined || iLevel === null || Number.isNaN(iLevel))
            defOptions.logLevel = 3;

        (window as any)["ntt_disableKeyboardOnMobile"] = defOptions.disableKeyboardOnMobile;

        if (defOptions.fontSize == DeviceSettingsFontSize.Big)
            document.body.classList.add("ntt-WMSFontSize-Big");
        else
            document.body.classList.remove("ntt-WMSFontSize-Big");

        return defOptions;
    }

    public getScannerSettings() {

        let deviceSettings = this.getDeviceSettings();

        let defOptions: any = {
            handleFocusedElement: deviceSettings.handleFocusedElement,
            triggerOneTime: deviceSettings.triggerOneTime,
            replaceGS1Separator: deviceSettings.replaceGS1Separator,
            GS1FunctionKey: deviceSettings.GS1FunctionKey,
            GS1Code: deviceSettings.GS1Code,
            GS1ReplacementCharacter: deviceSettings.GS1ReplacementCharacter,
            scanningMode: deviceSettings.scanningMode,
            intervalForDetection: deviceSettings.intervalForDetection,
            prefix: deviceSettings.prefix,
            suffix: deviceSettings.suffix,
            maxPrefixSuffixScanningTime: deviceSettings.maxPrefixSuffixScanningTime
        };

        return defOptions;
    }

    public useBatchRequests() {
        return this.getDeviceSettings().batchRequests;
    }

    public getEnabledComplexBarcodes() {
        return this.useComplexBarcodes;
    }

    public getEnabledSpeechAPI() {
        return this.useSpeechAPI;
    }

    public getRestService(): RestService {
        return this.restService;
    }

    public async getModuleSettings(bForceRefresh: boolean = false): Promise<ComponentSettings> {

        if (!this._moduleSettings || bForceRefresh) {

            let oResp = await this.restService.requestGET("/CORE_MODULES('WMS_MODULE')");
            this._moduleSettings = {} as any;
            oResp.CORE_MSETTINGSCollection.forEach((element: any) => {
                (this._moduleSettings as any)[element.U_KEY] = element.U_VALUE;
            });

            if (!this._moduleSettings.VIEW_NAME)
                this._moduleSettings.VIEW_NAME = "NTT_UI5WMS_ITEMS_B1SLQuery";

            this.useComplexBarcodes = this._moduleSettings.USE_COMPLEX_BARCODES == "Y";
            //this.useSpeechAPI = this._moduleSettings.USE_COMPLEX_BARCODES == "Y";
            this.barcodeFieldValidation = this._moduleSettings.BARCODE_FIELD_VALIDATION || this.barcodeFieldValidation;
        }
        return this._moduleSettings;
    }

    public async getMainModuleSettings(bForceRefresh: boolean = false): Promise<any> {

        if (!this._mainModuleSettings || bForceRefresh) {

            let oResp = await this.restService.requestGET("/CORE_MODULES('MAIN')");
            this._mainModuleSettings = {};
            oResp.CORE_MSETTINGSCollection.forEach((element: any) => {
                this._mainModuleSettings[element.U_KEY] = element.U_VALUE;
            });

        }
        return this._mainModuleSettings;
    }

    public getViewName(): string {
        return this._moduleSettings.VIEW_NAME;
    }

    public async getLicenseData(): Promise<WMSLicenses> {
        return new RestService({ baseUrl: '/wms' }).requestGET("/license") as WMSLicenses;
    }

    public async getSessionInfoBatch(): Promise<void> {

        let aBatchData = new Array<BatchParameters>();


        if (this._session.SessionInfo.Version <= "1000150") {
            aBatchData?.push({
                url: `/Users(${this._session.User.InternalKey})`,
                type: BatchParametersTypeENUM.GET,
            })
        } else {
            aBatchData?.push({
                url: "/UsersService_GetCurrentUser",
                type: BatchParametersTypeENUM.GET,
            })
        }

        aBatchData?.push({
            url: "/CORE_MODULES('WMS_MODULE')",
            type: BatchParametersTypeENUM.GET,
        })

        aBatchData?.push({
            url: "/CORE_MODULES('MAIN')",
            type: BatchParametersTypeENUM.GET,
        })

        aBatchData = await this.getRestService().BATCHRequest(aBatchData, false);

        {
            this._user = aBatchData[0].response?.data as B1User;

            try {
                this._user.EmployeesInfo = ((await this.restService.requestGET(`/EmployeesInfo?$filter=ApplicationUserID eq ${this._user.InternalKey}`)).value as Array<EmployeesInfo>)[0];
            } catch (e: any) {
                Log.warning("getCurrentUser", e.message);
            }

            this.setModel(new JSONModel(this._user), "user");
        }

        {
            let oResp = aBatchData[1].response?.data;
            this._moduleSettings = {} as any;
            oResp.CORE_MSETTINGSCollection.forEach((element: any) => {
                (this._moduleSettings as any)[element.U_KEY] = element.U_VALUE;
            });

            if (!this._moduleSettings.VIEW_NAME)
                this._moduleSettings.VIEW_NAME = "NTT_UI5WMS_ITEMS_B1SLQuery";

            this.useComplexBarcodes = this._moduleSettings.USE_COMPLEX_BARCODES == "Y";
            //this.useSpeechAPI = this._moduleSettings.USE_COMPLEX_BARCODES == "Y";
            this.barcodeFieldValidation = this._moduleSettings.BARCODE_FIELD_VALIDATION || this.barcodeFieldValidation;
        }

        {

            let oResp = aBatchData[2].response?.data;
            this._mainModuleSettings = {};
            oResp.CORE_MSETTINGSCollection.forEach((element: any) => {
                this._mainModuleSettings[element.U_KEY] = element.U_VALUE;
            });

        }
    }

    public async getCurrentUser(bForceRefresh: boolean = false): Promise<B1User> {

        if (!this._user || bForceRefresh) {

            if (this._session.SessionInfo.Version <= "1000150") {
                this._user = await this.restService.requestGET(`/Users(${this._session.User.InternalKey})`) as B1User;
            } else {
                this._user = await this.restService.requestGET("/UsersService_GetCurrentUser") as B1User;
            }


            try {
                this._user.EmployeesInfo = ((await this.restService.requestGET(`/EmployeesInfo?$filter=ApplicationUserID eq ${this._user.InternalKey}`)).value as Array<EmployeesInfo>)[0];
            } catch (e: any) {
                Log.warning("getCurrentUser", e.message);
            }

            this.setModel(new JSONModel(this._user), "user");
        }

        return this._user;
    }


    public async getSessionInfo(bForceRefresh: boolean = false): Promise<SessionInformation> {

        if (!this._session || bForceRefresh) {
            this._session = await this.restService.requestGET("/script/NTT/Module_Main('GetSession')") as SessionInformation;

            this.setModel(new JSONModel(this._session), "session");
        }

        return this._session;
    }

    public async calculateQueryFilterAsync($filter: string, removenull: boolean = false) {

        if (!$filter)
            return null;

        let oUser = await this.getCurrentUser();
        let oEmployeesInfo = oUser.EmployeesInfo;

        const regexDate = /@(?<DATEFUNC>DATETIME|DATE|TIME|WEEKDAY|WEEKYEAR|MONTH)(?<DATEOPERATION>[+-]){0,1}(?<DATENUM>[\d]*)*/gm;
        const regexUser = /@User\.(?<property>[a-zA-Z0-9_]+)/gm;
        const regexEmployee = /@EmployeesInfo\.(?<property>[a-zA-Z0-9_]+)/gm;

        var str = `${$filter}`;
        let m: any;
        while ((m = regexDate.exec(str)) !== null) {
            if (m.index === regexDate.lastIndex) {
                regexDate.lastIndex++;
            }
            if (m && m.groups) {
                let _dateFunc = m.groups["DATEFUNC"];
                let _dateOp = m.groups["DATEOPERATION"];
                let _dateNum = m.groups["DATENUM"];

                let now = new Date();
                if (_dateOp && _dateNum) {
                    now = now.addDays(parseInt(`${_dateOp}${_dateNum}`));
                }

                let _currDateTime = now.toISOStringArray();

                switch (_dateFunc) {
                    case "DATETIME":
                        str = str.replace(m[0], `${_currDateTime[0]} ${_currDateTime[1]}`);
                        break;
                    case "DATE":
                        str = str.replace(m[0], `${_currDateTime[0]}`);
                        break;
                    case "TIME":
                        str = str.replace(m[0], `${_currDateTime[1]}`);
                        break;
                    case "WEEKDAY":
                        let _weekday = now.getDay();
                        if (_weekday == 0)
                            _weekday = 7;
                        str = str.replace(m[0], `${_weekday}`);
                        break;
                    case "WEEKYEAR":
                        str = str.replace(m[0], `${now.getWeek()}`);
                        break;
                    case "MONTH":
                        str = str.replace(m[0], `${now.getMonth() + 1}`);
                        break;
                }
            }
        }

        while ((m = regexUser.exec(str)) !== null) {
            if (m.index === regexUser.lastIndex) {
                regexUser.lastIndex++;
            }
            if (m && m.groups) {
                Object.getOwnPropertyNames(m.groups).forEach(prop => {
                    str = str.replace(`@User.${m.groups[prop]}`, (oUser as any)[m.groups[prop]]);
                })
            }
        }

        while ((m = regexEmployee.exec(str)) !== null) {
            if (m.index === regexEmployee.lastIndex) {
                regexEmployee.lastIndex++;
            }
            if (m && m.groups) {
                Object.getOwnPropertyNames(m.groups).forEach(prop => {
                    if (oEmployeesInfo)
                        str = str.replace(`@EmployeesInfo.${m.groups[prop]}`, (oEmployeesInfo as any)[m.groups[prop]]);
                    else
                        str = str.replace(`@EmployeesInfo.${m.groups[prop]}`, removenull ? '' : 'null');
                })
            }
        }

        return str;
    }

    public calculateQueryFilter($filter: string, removenull: boolean = false) {

        if (!$filter)
            return null;

        let oUser = this._user;
        let oEmployeesInfo = oUser.EmployeesInfo;

        const regexDate = /@(?<DATEFUNC>DATETIME|DATE|TIME|WEEKDAY|WEEKYEAR|MONTH)(?<DATEOPERATION>[+-]){0,1}(?<DATENUM>[\d])*/gm;
        const regexUser = /@User\.(?<property>[a-zA-Z0-9_]+)/gm;
        const regexEmployee = /@EmployeesInfo\.(?<property>[a-zA-Z0-9_]+)/gm;

        var str = `${$filter}`;
        let m: any;
        while ((m = regexDate.exec(str)) !== null) {
            if (m.index === regexDate.lastIndex) {
                regexDate.lastIndex++;
            }
            if (m && m.groups) {
                let _dateFunc = m.groups["DATEFUNC"];
                let _dateOp = m.groups["DATEOPERATION"];
                let _dateNum = m.groups["DATENUM"];

                let now = new Date();
                if (_dateOp && _dateNum) {
                    now = now.addDays(parseInt(`${_dateOp}${_dateNum}`));
                }

                let _currDateTime = now.toISOStringArray();

                switch (_dateFunc) {
                    case "DATETIME":
                        str = str.replace(m[0], `${_currDateTime[0]} ${_currDateTime[1]}`);
                        break;
                    case "DATE":
                        str = str.replace(m[0], `${_currDateTime[0]}`);
                        break;
                    case "TIME":
                        str = str.replace(m[0], `${_currDateTime[1]}`);
                        break;
                    case "WEEKDAY":
                        let _weekday = now.getDay();
                        if (_weekday == 0)
                            _weekday = 7;
                        str = str.replace(m[0], `${_weekday}`);
                        break;
                    case "WEEKYEAR":
                        str = str.replace(m[0], `${now.getWeek()}`);
                        break;
                    case "MONTH":
                        str = str.replace(m[0], `${now.getMonth() + 1}`);
                        break;
                }
            }
        }

        while ((m = regexUser.exec(str)) !== null) {
            if (m.index === regexUser.lastIndex) {
                regexUser.lastIndex++;
            }
            if (m && m.groups) {
                Object.getOwnPropertyNames(m.groups).forEach(prop => {
                    str = str.replace(`@User.${m.groups[prop]}`, (oUser as any)[m.groups[prop]]);
                })
            }
        }

        while ((m = regexEmployee.exec(str)) !== null) {
            if (m.index === regexEmployee.lastIndex) {
                regexEmployee.lastIndex++;
            }
            if (m && m.groups) {
                Object.getOwnPropertyNames(m.groups).forEach(prop => {
                    if (oEmployeesInfo)
                        str = str.replace(`@EmployeesInfo.${m.groups[prop]}`, (oEmployeesInfo as any)[m.groups[prop]]);
                    else
                        str = str.replace(`@EmployeesInfo.${m.groups[prop]}`, removenull ? '' : 'null');
                })
            }
        }

        return str;

    }


    public generateExtraColumns(colStr: string, controller?: Controller, model: string = "sl") {

        let cols = new Array<ExtraColumn>();

        if (colStr) {
            try {
                let _oObj = eval(`JSON.parse(\`{${colStr}}\`)`);

                Object.getOwnPropertyNames(_oObj).forEach(prop => {
                    if (typeof (_oObj[prop]) === "string") {

                        let oPropertyBinding: PropertyBindingInfo = {
                            path: `${model}>${prop}`,
                            targetType: 'any'
                        };

                        if (prop.toLowerCase().includes("date")) {
                            oPropertyBinding.formatter = (_dateStr: string) => {
                                if (this.isValidDate(_dateStr)) {
                                    return _dateStr.substring(0, 10);
                                }
                            }
                        }
                        cols.push({
                            label: _oObj[prop],
                            text: oPropertyBinding,
                            property: prop,
                            visible: true
                        })
                    } else if (typeof (_oObj[prop]) === "object") {

                        let oBindingInfo = _oObj[prop];

                        let oPropertyBinding: PropertyBindingInfo | string = oBindingInfo.text ?
                            oBindingInfo.text :
                            {
                                path: oBindingInfo.path || `sl>${prop}`,
                                model: oBindingInfo.model,
                                targetType: oBindingInfo.targetType,
                                parts: oBindingInfo.parts,
                                useRawValues: oBindingInfo.useRawValues,
                                formatOptions: oBindingInfo.formatOptions,
                                formatter: this.getFormatterFunction(oBindingInfo.formatter, controller),
                                type: oBindingInfo.type
                            };

                        let oCol: ExtraColumn = {
                            label: oBindingInfo.label || prop,
                            text: oPropertyBinding,
                            expand: oBindingInfo.expand,
                            property: oBindingInfo.property || prop,
                            visible: oBindingInfo.visible == false ? false : true,
                            icon: this.generatePropertyBinding(oBindingInfo.icon, controller),
                            state: this.generatePropertyBinding(oBindingInfo.state, controller)
                        };

                        if (oBindingInfo.validValues && oBindingInfo.validValues?.path) {

                            let sKeyProperty = oBindingInfo.validValues.keyProperty || 'Code';
                            let sValueProperty = oBindingInfo.validValues.valueProperty || 'Name';

                            (oPropertyBinding as PropertyBindingInfo).formatter = (_v: any) => {

                                if (!_v)
                                    return null;

                                let _valObj = oCol.validValues?.find(_r => _r[sKeyProperty] == _v)
                                return (_valObj ? _valObj[sValueProperty] : "") || "";

                            }

                            (oPropertyBinding as PropertyBindingInfo).targetType = 'any';

                            (oCol as any).getValidValues = async () => {
                                oCol.validValues = await this.restService.requestGETALL(oBindingInfo.validValues?.path);
                                return oCol.validValues;
                            }
                        }

                        cols.push(oCol)

                    }
                });

            } catch (e: any) {
                Log.error("generateExtraColumns", e.message);
            }
        }

        return cols;
    }

    private generatePropertyBinding(oBindingInfo: any, controller?: any): PropertyBindingInfo | string | undefined {

        if (!oBindingInfo)
            return undefined;

        if (typeof (oBindingInfo) === "object") {
            let oPropertyBinding: PropertyBindingInfo = {
                path: oBindingInfo.path,
                model: oBindingInfo.model,
                targetType: oBindingInfo.targetType,
                parts: oBindingInfo.parts,
                useRawValues: oBindingInfo.useRawValues,
                formatOptions: oBindingInfo.formatOptions,
                formatter: this.getFormatterFunction(oBindingInfo.formatter, controller),
                type: oBindingInfo.type
            };

            return oPropertyBinding;
        }

        return oBindingInfo || undefined;
    }

    public getFormatterFunction(path: string, obj: any): Function | undefined {

        if (!path || !obj)
            return undefined;

        let oFunc = path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null
        }, obj || self);

        if (oFunc && oFunc.bind)
            return (oFunc as Function).bind(obj);

        return undefined;
    }

    public isValidDate(d: Date | string): boolean {

        if (!d)
            return false;

        if (typeof (d) === 'string') {
            d = new Date(d);
        }

        return d instanceof Date && !isNaN(d.getTime());
    }

    public getSettingsData(): any {

        let settingsData = this.getCookie("settingsData");
        if (!settingsData)
            return null;

        return JSON.parse(settingsData);
    }

    public async onShowValueHelpRequest(parameters: ValueHelpParameters, selectedKey?: any): Promise<void> {

        var oSrc = parameters.Source;

        let aFilters = parameters.Filters;

        var iSearch: SearchField;
        var pDialog = new ValueHelpDialog({
            supportMultiselect: false,
            supportRanges: false,
            title: parameters.Title,
            key: parameters.KeyProperty,
            descriptionKey: parameters.NameProperty,
            filterBar: new FilterBar({
                advancedMode: true,
                basicSearch: iSearch = new SearchField({
                    search: async (oSearchEvent) => {
                        let sQuery = oSearchEvent.getParameter("query");
                        this.onSearchValueHelpDialog(sQuery, pDialog, aFilters);
                    }
                }),
                showGoOnFB: false,
                isRunningInValueHelpDialog: true
            }),
            ok: async (oEv) => {

                let pParams = oEv.getParameters();
                let oItem = pParams.tokens[0]?.data("row");
                if (oItem) {
                    try {
                        if (parameters.onSelect) {
                            parameters.onSelect.call(parameters.controller || this, oItem);
                            pDialog.close();
                            return;
                        }

                        oSrc?.setSelectedKey(`${oItem[parameters.KeyProperty]}`);
                        oSrc?.setValue(`${oItem[parameters.NameProperty]} (${oItem[parameters.KeyProperty]})`);
                        pDialog.close();
                    } catch (err: any) {
                        MessageBox.error(err.message);
                    } finally {
                        pDialog.setBusy(false);
                    }
                }
            },
            cancel: (oEv) => {
                pDialog.close();
            },
            afterClose: () => {
                pDialog.destroy();
            }
        });

        pDialog.open();

        let oCols = parameters.Columns;

        let oBindData = parameters.Binding;
        if (!oBindData.events)
            oBindData.events = {};

        if (!oBindData.events["dataReceived"]) {
            oBindData.events.dataReceived = function (oDataEv: Event) {
                if (oDataEv.getParameter("error")) {
                    MessageBox.error(oDataEv.getParameter("error").message);
                    return;
                }
                if (iSearch && iSearch.getValue()) {
                    let oBinding: ODataListBinding = oTable.getBinding("items") || oTable.getBinding("rows");
                    if (oBinding.getCount() == 1) {
                        let oContext: Context = oBinding.getContexts()[0];
                        let oItem = oContext.getObject() as any;
                        if (oItem[parameters.KeyProperty] == iSearch.getValue())
                            pDialog.fireOk({ tokens: [new Token().data("row", oItem)] });
                    }
                }
                pDialog.update();
            }
        }


        var oTable = await pDialog.getTableAsync();
        oTable.setBusyIndicatorDelay(0);
        if (oTable.bindRows) {

            oTable.bindAggregation("rows", oBindData);
            oCols.forEach(oCol => {
                oTable.addColumn(new UIColumn({ label: oCol.label, template: new Text({ text: oCol.text, wrapping: false }) }));
            })
        }

        if (oTable.bindItems) {

            (oTable as Table).setMode("None");
            (oTable as Table).setGrowing(true);
            (oTable as Table).setGrowingScrollToLoad(false);
            (oTable as Table).setGrowingThreshold(20);
            (oTable as Table).setAutoPopinMode(true);

            let oCells: Array<any> = [];
            oCols.forEach(oCol => {
                oCells.push(new Label({ text: oCol.text }))
            });

            oBindData["template"] = new ColumnListItem({
                cells: oCells,
                type: "Navigation",
                press: (oEv) => {
                    let row = (oEv.getSource() as ColumnListItem);
                    let oItem = row.getBindingContext()?.getObject() as any;
                    if (oItem) {
                        pDialog.fireOk({ tokens: [new Token().data("row", oItem)] });
                    }
                }
            });

            (oTable as Table).bindAggregation("items", oBindData);

            oCols.forEach(oCol => {
                oTable.addColumn(new MColumn({ header: new Label({ text: oCol.label }) }));
            })
        }

        pDialog.setModel(parameters.Model);

        pDialog.update();

        if (selectedKey !== undefined) {
            pDialog.setBasicSearchText(selectedKey);
            iSearch.fireSearch({ query: selectedKey });
        }
    }

    public async onSearchValueHelpDialog(sQuery: string | null, pDialog: ValueHelpDialog, aFilters: Array<ODataListBindingFilter>) {

        let _oTable = await pDialog.getTableAsync() as any;
        let oRowBinding = (_oTable.getBinding("rows") || _oTable.getBinding("items")) as ODataListBinding;

        let metaModel = oRowBinding.getModel().getMetaModel();
        let metaData = await (metaModel as any).requestData();

        if (!sQuery) {
            oRowBinding.filter(undefined);
            return;
        }

        aFilters.forEach((f) => {
            f.FilterType = f.FilterType || (metaModel as any).getUI5Type(`${oRowBinding.getPath()}/${f.FilterProperty}`);
            let fOp = f.DefaultFilterOperator;
            if (!fOp) {
                if (f.FilterType == "String" || ((f.FilterType as any).getName && (f.FilterType as any).getName() == 'sap.ui.model.odata.type.String')) {
                    f.DefaultFilterOperator = FilterOperator.Contains;
                } else {
                    f.DefaultFilterOperator = FilterOperator.EQ;
                }
            }
        })

        let _filters = new Filter({
            filters: aFilters.filter(f => {
                let fType = f.FilterType;
                if (fType == "Integer" || fType == "Float") {
                    return !Number.isNaN(parseFloat(sQuery));
                }
                return !!fType;
            }).map(f => {
                let fOp = f.DefaultFilterOperator;
                return new Filter({ path: f.FilterProperty, operator: fOp || "EQ", value1: sQuery });
            }), and: false
        });

        oRowBinding.filter(_filters);
    }

    private getBarCodeRegex(barcodeFormat: string) {

        const regex = new RegExp(this.barcodeRegex);
        const str = `${barcodeFormat}`;
        var retStr = `${barcodeFormat}`;

        let m: any;

        while ((m = regex.exec(str)) !== null) {

            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.groups?.Field)
                retStr = retStr.replace(m.groups?.Field, `(?<${m.groups?.Name}>${this.barcodeFieldValidation})`);
        }

        return new RegExp(retStr);
    }

    public validateBarCode(barcodeFormat: string, barCode: string) {
        try {
            const regex = this.getBarCodeRegex(barcodeFormat);

            const str = `${barCode}`;
            var retObj: any = {};

            let m: any = regex.exec(str)
            if (m.groups) {
                Object.getOwnPropertyNames(m.groups).forEach(prop => {
                    retObj[prop] = m.groups[prop];
                })
            }

            return retObj;
        }
        catch (err) {
            return { error: err };
        }
    }

    public async getColumnMetaData(viewModel: ODataModel, viewName: string) {
        let metaModel = viewModel.getMetaModel();
        let metaData = await metaModel.requestData();

        let oViewData = metaData["SAPB1." + viewName];

        return Object.getOwnPropertyNames(oViewData).filter((x) => !x.startsWith("$") && oViewData[x]["$kind"] == 'Property')
            .map((x) => {
                return {
                    name: x,
                    type: oViewData[x]["$Type"],
                    maxLength: oViewData[x]["$MaxLength"],
                    nullable: oViewData[x]["$Nullable"],
                }
            });
    }

    public setCookie(name: string, value: string, days: int) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    public getCookie(name: string) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    public eraseCookie(name: string) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    public async registerService(name: string, service: BaseService) {
        (service as any)._component = this;
        await service.init();
        this._registeredServices[name] = service;
        return this;
    }

    public getRegisteredService<T>(name: string) {
        return this._registeredServices[name] as T;
    }

    public getODBCService() {
        return this.getRegisteredService("ODBCService") as ODBCService;
    }

    public getVirtualThemeManager(): VirtualThemeManager {
        return VirtualThemeManager.getInstance();
    }

}