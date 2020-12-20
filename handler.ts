import axios from "axios";
import * as twilio from "twilio";
import * as queryString from "query-string";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const validNumbers = process.env.PHONE_NUMBERS!.split("::");
const albumId = process.env.ALBUM_ID;
const refreshToken = process.env.REFRESH_TOKEN;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const client = twilio(accountSid, authToken);

const getOauth = async (): Promise<string> => {
  const data = await axios.post(`https://oauth2.googleapis.com/token?grant_type=${'refresh_token'}&refresh_token=${refreshToken}&client_id=${clientID}&client_secret=${clientSecret}`);
  console.log(data.data.access_token);
  return data.data.access_token;
};

export const sms = async (req: any) => {
  console.log("Uploading... " + new Date().toString());

  const bearerToken = await getOauth();

  const body = queryString.parse(
    Buffer.from(req.body, "base64").toString("utf-8")
  ) as {
    NumMedia: string;
    From: string;
    MessageSid: string;
  };

  const { NumMedia, From: SenderNumber, MessageSid } = body;
  const numOfPhotos = parseInt(NumMedia);
  if (!validNumbers.includes(SenderNumber)) {
    client.messages.create({
      body: `Not a valid phone number`,
      from: twilioNumber,
      to: SenderNumber,
    });
    return {
      success: false,
    };
  }

  try {
    for (var i = 0; i < numOfPhotos; i++) {
      let mediaUrl: string = body[`MediaUrl${i}`];

      const image = await axios.request({
        method: "GET",
        url: mediaUrl,
        responseType: "arraybuffer",
        // @ts-ignore
        responseEncoding: "binary",
      });

      let url = "https://photoslibrary.googleapis.com/v1/uploads";
      let r = await axios.post(url, image.data, {
        headers: {
          "X-Goog-Upload-Protocol": "raw",
          "Content-Type": "application/octet-stream",
          Authorization: "Bearer " + bearerToken,
        },
      });

      let reqBody = {
        albumId: albumId,
        newMediaItems: [
          {
            description: new Date().toString(),
            simpleMediaItem: {
              uploadToken: r.data,
            },
          },
        ],
      };

      let response = await axios.post(
        "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate",
        reqBody,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + bearerToken,
          },
        }
      );
    }

    client.messages.create({
      body: `${NumMedia} picture${numOfPhotos > 1 ? "s" : ""} uploaded!`,
      from: twilioNumber,
      to: SenderNumber,
    });
  }
  catch (err) {
    console.log(err);
    return {
      success: false,
    }
  }

  return {
    success: true,
  };
};
