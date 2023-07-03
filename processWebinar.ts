import { Request, Response} from "express";

export const sendResponseZoom = (
  res: Response,
  message: any,
  status: number
) => {
  res.status(status).json(message);
};

let fetchPromise: Promise<void>;

export const processWebinarEvent = async (req: Request, res: Response) => {
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

    let requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: bodyString,
      redirect: "follow",
    };

    fetchPromise = fetch(
      "https://certapps.donweb.com/items/webinar",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  } else if (req.body.event === "webinar.updated") {
    //console.log("sadlñgfkhjalñghaslkghjlsdfkñsdfaglñh");
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
    // Usando for
    for (let key of Object.keys(newJson)) {
      if (newJson[key as keyof typeof newJson] === null) {
        delete newJson[key as keyof typeof newJson];
      }
    }

    // Usando map
    Object.keys(newJson).map((key) => {
      if (newJson[key as keyof typeof newJson] === undefined) {
        delete newJson[key as keyof typeof newJson];
      }
    });

    console.log(newJson);
    const bodyString = JSON.stringify(newJson);

    let requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: bodyString,
      redirect: "follow",
    };

    fetchPromise = fetch(
      `https://certapps.donweb.com/items/webinar/${newJson.id_webinar}`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    /*     fetchPromise = await fetchCustom(
      `https://certapps.donweb.com/items/webinar/${newJson.id_webinar}`,
      "PATCH",
      newJson,
      "webinar updated"
    ); */
  } else if (req.body.event === "webinar.deleted") {
    let requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    fetchPromise = fetch(
      `https://certapps.donweb.com/items/webinar/${payload.object.id}`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    /* fetchPromise = await fetchCustom(
      `https://certapps.donweb.com/items/webinar/${newJson.id_webinar}`,
      "DELETE",
      newJson,
      "webinar deleted"
    ); */
  } else if (req.body.event === "webinar.registration_created") {
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

    let requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: bodyString,
      redirect: "follow",
    };

    fetchPromise = fetch(
      "https://certapps.donweb.com/items/registrado",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    /*     fetchPromise = await fetchCustom(
      "https://certapps.donweb.com/items/registrado",
      "POST",
      registrationJson,
      "registration_created"
    ); */
  } else if (req.body.event === "webinar.participant_joined") {
    const participantObjet = {
      estado_asistencia: true,
    };
    const bodyString = JSON.stringify(participantObjet);
    console.log(participantObjet);

    let requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: bodyString,
      redirect: "follow",
    };

    fetchPromise = fetch(
      `https://certapps.donweb.com/items/registrado/${payload.object.participant.registrant_id}`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
    /* fetchPromise = await fetchCustom(
      `https://certapps.donweb.com/items/registrado/${participantObjet.id_registrado}`,
      "PATCH",
      participantObjet,
      "Participant joined"
    ); */
  } else if (req.body.event === "webinar.registration_cancelled") {
    let requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    fetchPromise = fetch(
      `https://certapps.donweb.com/items/registrado/${payload.object.participant.registrant_id}`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    /*     fetchPromise = await fetchCustom(
      `https://certapps.donweb.com/items/registrado/${payload.object.id}`,
      "DELETE",
      {},
      "registration cancelled"
    );
  } */
  }

  if (fetchPromise) {
    console.log(fetchPromise.then);
    fetchPromise
      .then((result) => {
        sendResponseZoom(
          res,
          { message: "Authorized request to Zoom Webhook." },
          200
        );

        let objetLog = {
          event:`${req.body.event}`,
          event_ts: `${req.body.event_ts}`,
          body: `${JSON.stringify(req.body)}`,
        };
        const logString = JSON.stringify(objetLog);
        console.log(objetLog);

        let requestOptions: RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: logString,
          redirect: "follow",
        };

        fetchPromise = fetch(
          `https://certapps.donweb.com/items/logs`,
          requestOptions
        )
          .then((response) => response.text())
          .then((result) => console.log(result))
          .catch((error) => console.log("error", error));
      })
      .catch((error) => {
        console.log(error);
        sendResponseZoom(res, { message: "no content." }, 204);
      });
  } else {
    console.log("no se asigno nada");
    sendResponseZoom(res, { message: "no content." }, 204);
  }
};
