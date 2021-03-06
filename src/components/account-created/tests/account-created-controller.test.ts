import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  accountCreatedGet,
  accountCreatedPost,
} from "../account-created-controller";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("account created controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountCreatedGet", () => {
    it("should render account created page", () => {
      req.session.client.serviceType = "MANDATORY";
      req.session.client.name = "test client name";

      accountCreatedGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("account-created/index.njk");
    });
  });
  describe("accountCreatedPost", () => {
    it("should redirect to auth code", () => {
      accountCreatedPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
    it("should redirect to share-info when consent is required", () => {
      req.session.user.isConsentRequired = true;
      accountCreatedPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.SHARE_INFO);
    });
  });
});
