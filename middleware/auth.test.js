"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, isAdmin } = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const testAdmin = jwt.sign(
  { username: "testAdmin", isAdmin: true },
  SECRET_KEY
);

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

/** Tests the isAdmin middleware */
describe("isAdmin", () => {
  const req = {};
  test("Should call next if user is admin", () => {
    const res = { locals: { user: { is_admin: true } } };
    // jest.fn() creates a new mock function so that there is a next function to call.
    // it's not really important to the test what next is, just so long as it's been called.
    const next = jest.fn();
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  test("Should throw Unauthorized Error if user is not admin", () => {
    const res = { locals: { user: { is_admin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    isAdmin(req, res, next);
  });
});