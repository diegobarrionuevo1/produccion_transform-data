"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const processWebinar_1 = require("./processWebinar");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.status(200);
    res.send(`Zoom webhook is running correctly.`);
});
app.post("/webhook", (req, res) => {
    const message = `v0:${req.headers["x-zm-request-timestamp"]}:${JSON.stringify(req.body)}`;
    try {
        const hashForVerify = crypto_1.default
            .createHmac("sha256", `${process.env.ZOOM_WEBHOOK_SECRET_TOKEN}`)
            .update(message)
            .digest("hex");
        const signature = `v0=${hashForVerify}`;
        if (req.headers["x-zm-signature"] === signature) {
            console.log("Verificandooooooooooooooooooooooooooooooooooooooooo");
            if (req.body.event === "endpoint.url_validation") {
                const hashForValidate = crypto_1.default
                    .createHmac("sha256", `${process.env.ZOOM_WEBHOOK_SECRET_TOKEN}`)
                    .update(req.body.payload.plainToken)
                    .digest("hex");
                (0, processWebinar_1.sendResponseZoom)(res, {
                    plainToken: req.body.payload.plainToken,
                    encryptedToken: hashForValidate,
                }, 200);
                console.log("successful validation");
            }
            else {
                console.log(req.body);
                (0, processWebinar_1.processWebinarEvent)(req, res);
            }
        }
        else {
            (0, processWebinar_1.sendResponseZoom)(res, "Unauthorized request to Zoom Webhook.", 401);
        }
    }
    catch (error) {
        console.error("Error:", error);
        (0, processWebinar_1.sendResponseZoom)(res, { message: "Internal server error." }, 500);
    }
});
app.listen(port, () => console.log(`Zoom Webhook listening on port ${port}!`));
