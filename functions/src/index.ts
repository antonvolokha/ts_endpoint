import * as functions from "firebase-functions";
import { Config } from "./configs/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import creds from "./configs/config.json";

export const saveData = functions.https.onRequest(async (request, response) => {

  if (request.method !== Config.ALLOWED_METHOD) {
    response.json({status: 'NOT OK'});
    return;
  }

  if (request.header("token") !== Config.METHOD_TOKEN) {
    response.json({status: 'TOKEN NOT OK'});
    return;
  }

  const data = request.body;

  if (!data) {
    response.json({status: 'DATA EMPTY'});
    return;
  }

  const doc = new GoogleSpreadsheet(Config.SHEET_ID);

  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  //const rows = await sheet.getRows();

  const keys = Object.keys(data);

  await sheet.setHeaderRow(keys);


  const row = await sheet.addRow(data);
  row.save();

  response.json({
    status: 'OK'
  });
});
