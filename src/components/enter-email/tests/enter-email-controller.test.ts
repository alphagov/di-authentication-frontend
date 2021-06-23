import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../tests/utils/test-utils";
import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../../services/authentication-service.interface";
import { enterEmailGet, enterEmailPost } from "../enter-email-controller";
import { UserSession } from "../../../types";
import { NotificationServiceInterface } from "../../../services/notification-service.interface";

describe("enter-email controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
    next = sinon.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enterEmailGet", () => {
    it("should render enter email view", () => {
      enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-email/index.njk");
    });
  });

  describe("enterEmailPost", () => {
    it("should redirect to enter-password when account exists", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(true),
        signUpUser: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, null)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/enter-password");
    });

    it("should redirect to verify-email when no account exists", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.returns(false),
        signUpUser: sandbox.fake(),
      };

      const fakeNotificationService: NotificationServiceInterface = {
        sendNotification: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, fakeNotificationService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).to.have.calledWith("/check-your-email");
      expect(fakeNotificationService.sendNotification).to.have.calledOnce;
      expect(fakeUserAuthService.userExists).to.have.calledOnce;
    });

    it("should call next with error when api throws error", async () => {
      const fakeUserAuthService: AuthenticationServiceInterface = {
        userExists: sandbox.fake.throws(Error("error")),
        signUpUser: sandbox.fake(),
      };

      req.body.email = "test.test.com";
      req.session.user.id = "test.test.com";

      await enterEmailPost(fakeUserAuthService, null)(
        req as Request,
        res as Response,
        next
      );

      expect(next).to.be.calledOnce;
    });

    it("should throw invalid session error when session not populated", async () => {
      req.session = undefined;

      await expect(
        enterEmailPost(null, null)(req as Request, res as Response, next)
      );

      expect(next).to.have.been.calledOnce;
    });
  });
});