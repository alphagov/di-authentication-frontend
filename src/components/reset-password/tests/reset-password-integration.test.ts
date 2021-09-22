import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../app.constants";

describe("Integration::reset password", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  const ENDPOINT = "/reset-password?code=WBTxBpSQdd3cSxT-!X5s.1758350212000";

  before(() => {
    sandbox = sinon.createSandbox();

    app = require("../../../app").createApp();
    baseApi = process.env.API_BASE_URL;

    request(app)
      .get(ENDPOINT)
      .end((err, res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sandbox.restore();
    app = undefined;
  });

  it("should return reset password page", (done) => {
    request(app).get(ENDPOINT).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .send({
        password: "password",
      })
      .expect(500, done);
  });

  it("should return to invalid link error when code missing from query param", (done) => {
    const invalidEndpoint = "/reset-password";
    request(app)
      .get(invalidEndpoint)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "That link has expired"
        );
      })
      .expect(200, done);
  });

  it("should return to invalid link error when code expired", (done) => {
    const invalidEndpoint =
      "/reset-password?code=WBTxBpSQdd3cSxT-!X5s.1631729877";
    request(app)
      .get(invalidEndpoint)
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "That link has expired"
        );
      })
      .expect(200, done);
  });

  it("should return validation error when password not entered", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "WBTxBpSQdd3cSxT-!X5s.1758350212000",
        password: "",
        "confirm-password": "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains("Enter your password");
      })
      .expect(400, done);
  });

  it("should return validation error when passwords don't match", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "WBTxBpSQdd3cSxT-!X5s.1758350212000",
        password: "sadsadasd33da",
        "confirm-password": "sdnnsad99d",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#confirm-password-error").text()).to.contains(
          "Enter the same password in both fields"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when password less than 8 characters", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "WBTxBpSQdd3cSxT-!X5s.1758350212000",
        password: "dad",
        "confirm-password": "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains(
          "Your password must be at least 8 characters long and must include a number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when password not valid", (done) => {
    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "WBTxBpSQdd3cSxT-!X5s.1758350212000",
        password: "testpassword",
        "confirm-password": "testpassword",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#password-error").text()).to.contains(
          "Your password must be at least 8 characters long and must include a number"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /reset-password-confirmation when valid password entered", (done) => {
    nock(baseApi).post("/reset-password").once().reply(200, { success: true });

    request(app)
      .post(ENDPOINT)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "WBTxBpSQdd3cSxT-!X5s.1758350212000",
        password: "Testpassword1",
        "confirm-password": "Testpassword1",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_CONFIRMATION)
      .expect(302, done);
  });
});