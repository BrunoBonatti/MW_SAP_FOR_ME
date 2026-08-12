sap.ui.define([
    "sap/ui/core/UIComponent",
    "megawork/mwmonitorchamados/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("megawork.mwmonitorchamados.Component", {
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