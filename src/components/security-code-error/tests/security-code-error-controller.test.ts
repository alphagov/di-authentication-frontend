import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  securityCodeCannotRequestCodeGet,
  securityCodeInvalidGet,
  securityCodeTriesExceededGet,
} from "../security-code-error-controller";
import { SecurityCodeErrorType } from "../../common/constants";

describe("security code  controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {}, query: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("securityCodeExpiredGet", () => {
    it("should render security code expired view", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeInvalidGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("security-code-error/index.njk");
    });
  });

  describe("securityCodeTriesExceededGet", () => {
    it("should render security code requested too many times view", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeTriesExceededGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-too-many-requests.njk"
      );
    });
  });

  describe("securityCodeCannotRequestGet", () => {
    it("should render security code invalid request view", () => {
      req.query.actionType = SecurityCodeErrorType.EmailMaxCodesSent;

      securityCodeCannotRequestCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });
});
