import dotenv from "dotenv";
import express, { Request, Response } from "express";
import crypto from "crypto";
import { sendResponseZoom, processWebinarEvent } from "./processWebinar";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200);
  res.send(`Zoom webhook is running correctly.`);
});

app.post("/webhook", (req: Request, res: Response) => {
  // construye la cadena del mensaje
  const message = `v0:${req.headers["x-zm-request-timestamp"]}:${JSON.stringify(
    req.body
  )}`;
  try {
    const hashForVerify = crypto
      .createHmac("sha256", `${process.env.ZOOM_WEBHOOK_SECRET_TOKEN}`)
      .update(message)
      .digest("hex");

    // codifica la cadena del mensaje con el token secreto de Webhook y antepone la versión
    const signature = `v0=${hashForVerify}`;

    //validando que la request vino de Zoom

    if (req.headers["x-zm-signature"] === signature) {
      console.log("Verificandooooooooooooooooooooooooooooooooooooooooo");
      // Zoom validando que controlamos el endpoint del webhook
      if (req.body.event === "endpoint.url_validation") {
        const hashForValidate = crypto
          .createHmac("sha256", `${process.env.ZOOM_WEBHOOK_SECRET_TOKEN}`)
          .update(req.body.payload.plainToken)
          .digest("hex");

        sendResponseZoom(
          res,
          {
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate,
          },
          200
        );

        console.log("successful validation");
      } else {
        console.log(req.body);
        // lógica de negocio aquí, por ejemplo, haga una solicitud de API a Zoom o a un tercero
        processWebinarEvent(req, res);
      }
    } else {
      sendResponseZoom(res, "Unauthorized request to Zoom Webhook.", 401);
    }
  } catch (error) {
    console.error("Error:", error);
    sendResponseZoom(res, { message: "Internal server error." }, 500);
  }
});

app.listen(port, () => console.log(`Zoom Webhook listening on port ${port}!`));
