sap.ui.define([
    "sap/ui/core/UIComponent",
    "megawork/mwhelpdesk/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("megawork.mwhelpdesk.Component", {
        metadata: {
            manifest: "json",
        config: { fullWidth: true },
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            this.getRouter().initialize();
        }
    });
});