import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "../enter-password-controller";

import { PATH_NAMES } from "../../../app.constants";
import { EnterPasswordServiceInterface } from "../types";
import { MfaServiceInterface } from "../../common/mfa/types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("enter password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ENTER_PASSWORD,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterEmailGet", () => {
    it("should render enter email view", () => {
      enterPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });
  });

  describe("enterPasswordPost", () => {
    it("should redirect to enter-code when the password is correct", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "******3456",
            mfaRequired: true,
            consentRequired: false,
            latestTermsAndConditionsAccepted: true,
          },
          success: true,
        }),
      };

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(
        false,
        fakeService,
        fakeMfaService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
    });

    it("should redirect to auth code when mfa is not required", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: { redactedPhoneNumber: "******3456", mfaRequired: false },
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to enter phone number when phone number is not verified", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: {
            redactedPhoneNumber: "******3456",
            phoneNumberVerified: false,
          },
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
      );
    });

    it("should redirect to updated terms when terms and conditions not accepted", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "******3456",
            latestTermsAndConditionsAccepted: false,
          },
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS
      );
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.throws(error),
      };

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake(),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await expect(
        enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.loginUser).to.have.been.calledOnce;
    });
  });
});
