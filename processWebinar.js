"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWebinarEvent = exports.sendResponseZoom = void 0;
const sendResponseZoom = (res, message, status) => {
    res.status(status).json(message);
};
exports.sendResponseZoom = sendResponseZoom;
let fetchPromise;
const processWebinarEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body.payload;
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `${process.env.AUTHORIZATION}`);
    if (req.body.event === "webinar.created") {
        let newJson = {
            operator: payload.operator,
            url_zoom: payload.object.join_url,
            id_webinar: `${payload.object.id}`,
            date_webinar: payload.object.start_time,
            operator_id: payload.operator_id,
            uuid_webinar: payload.object.uuid,
            titulo_webinar: payload.object.topic,
        };
        const bodyString = JSON.stringify(newJson);
        console.log(newJson);
        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: bodyString,
            redirect: "follow",
        };
        fetchPromise = fetch("https://certapps.donweb.com/items/webinar", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    else if (req.body.event === "webinar.updated") {
        let newJson = {
            operator: payload.operator,
            url_zoom: payload.object.join_url,
            id_webinar: `${payload.object.id}`,
            date_webinar: payload.object.start_time,
            operator_id: payload.operator_id,
            uuid_webinar: payload.object.uuid,
            titulo_webinar: payload.object.topic,
        };
        console.log(newJson);
        for (let key of Object.keys(newJson)) {
            if (newJson[key] === null) {
                delete newJson[key];
            }
        }
        Object.keys(newJson).map((key) => {
            if (newJson[key] === undefined) {
                delete newJson[key];
            }
        });
        console.log(newJson);
        const bodyString = JSON.stringify(newJson);
        let requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: bodyString,
            redirect: "follow",
        };
        fetchPromise = fetch(`https://certapps.donweb.com/items/webinar/${newJson.id_webinar}`, requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    else if (req.body.event === "webinar.deleted") {
        let requestOptions = {
            method: "DELETE",
            headers: myHeaders,
            redirect: "follow",
        };
        fetchPromise = fetch(`https://certapps.donweb.com/items/webinar/${payload.object.id}`, requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    else if (req.body.event === "webinar.registration_created") {
        let registrationJson = {
            pais: payload.object.registrant.country,
            correo: payload.object.registrant.email,
            nombre: payload.object.registrant.first_name,
            pais_iso: "hay que resolverlo",
            apellido: payload.object.registrant.last_name,
            id_webinar: payload.object.id,
            id_registrado: payload.object.registrant.id,
            estado_de_asistencia: false,
        };
        const bodyString = JSON.stringify(registrationJson);
        console.log(registrationJson);
        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: bodyString,
            redirect: "follow",
        };
        fetchPromise = fetch("https://certapps.donweb.com/items/registrado", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    else if (req.body.event === "webinar.participant_joined") {
        const participantObjet = {
            estado_asistencia: true,
        };
        const bodyString = JSON.stringify(participantObjet);
        console.log(participantObjet);
        let requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: bodyString,
            redirect: "follow",
        };
        fetchPromise = fetch(`https://certapps.donweb.com/items/registrado/${payload.object.participant.registrant_id}`, requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    else if (req.body.event === "webinar.registration_cancelled") {
        let requestOptions = {
            method: "DELETE",
            headers: myHeaders,
            redirect: "follow",
        };
        fetchPromise = fetch(`https://certapps.donweb.com/items/registrado/${payload.object.participant.registrant_id}`, requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.log("error", error));
    }
    if (fetchPromise) {
        console.log(fetchPromise.then);
        fetchPromise
            .then((result) => {
            (0, exports.sendResponseZoom)(res, { message: "Authorized request to Zoom Webhook." }, 200);
            let objetLog = {
                event: `${req.body.event}`,
                event_ts: `${req.body.event_ts}`,
                body: `${JSON.stringify(req.body)}`,
            };
            const logString = JSON.stringify(objetLog);
            console.log(objetLog);
            let requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: logString,
                redirect: "follow",
            };
            fetchPromise = fetch(`https://certapps.donweb.com/items/logs`, requestOptions)
                .then((response) => response.text())
                .then((result) => console.log(result))
                .catch((error) => console.log("error", error));
        })
            .catch((error) => {
            console.log(error);
            (0, exports.sendResponseZoom)(res, { message: "no content." }, 204);
        });
    }
    else {
        console.log("no se asigno nada");
        (0, exports.sendResponseZoom)(res, { message: "no content." }, 204);
    }
});
exports.processWebinarEvent = processWebinarEvent;
