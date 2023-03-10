const express = require("express");
const app = express();
const port = 3001;
const awsParamEnv = require("aws-param-env");
const fetch = require("node-fetch");
const mainServicePrivateIp = "ip-10-0-2-5.us-east-2.compute.internal";

try {
  require("./secrets");
} catch (err) {
  const awsParamEnv = require("aws-param-env");
  awsParamEnv.load("/hello-world/dev", { region: "us-east-2" });
}

const logger = require("./logger");

const createApp = async () => {
  app.get("/health", (req, res) => {
    res.send(`${process.env.GOODBYE} from ${process.env.NODE_ENV}`);
  });
};

const startListening = async () => {
  const server = app.listen(port, async () => {
    logger.log("info", `Hello world from an EC2 instance in a private subnet`, {
      tags: "starting-service",
    });
  });
};

const bootApp = async () => {
  try {
    const response = await fetch(
      `http://${mainServicePrivateIp}:3001/check-cloudwatch`
    );
    await response.text();
    logger.log(
      "info",
      `Hello world pinging the main service using a private DNS`,
      {
        tags: "http",
      }
    );
  } catch (err) {
    logger.error(err);
  }

  await createApp();
  await startListening();
};

bootApp();
