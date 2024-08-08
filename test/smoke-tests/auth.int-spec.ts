import { INestApplication } from "@nestjs/common";
import { SessionFetchFn, StartSession } from "../util/fetch-with-session";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "@/database/entity/user.entity";
import { In, Not, Repository } from "typeorm";
import { SubjectEntity, SubjectType } from "@/database/entity/subject.entity";
import { RoleName } from "@/module/auth/role/types";
import { UserDto } from "@/module/user/user.dto";
import { RandomIntInRange, RandomName } from "@test/util/random";
import { SubjectDto } from "@/module/subject/subject.dto";

describe("Smoke Tests", () => {
  let baseUrl: string;
  let app: INestApplication;
  let sfetch: SessionFetchFn;

  let tstAdminId: number;
  let tstUserId: number;
  let tstAdminSubjectId: number;
  let tstUserSubjectId: number;
  let publicSubjectId: number;

  beforeAll(async () => {
    app = globalThis.app;
    baseUrl = `http://127.0.0.1:${process.env.APP_PORT}`;

    const userRepo: Repository<UserEntity> = app.get(
      getRepositoryToken(UserEntity),
    );
    tstAdminId = (await userRepo.findOneByOrFail({ name: "tst_admin" })).id;
    tstUserId = (await userRepo.findOneByOrFail({ name: "tst_user" })).id;

    const subjectRepo: Repository<SubjectEntity> = app.get(
      getRepositoryToken(SubjectEntity),
    );
    tstAdminSubjectId = (
      await subjectRepo.findOneByOrFail({
        private: true,
        createdBy: { id: tstAdminId },
      })
    ).id;
    tstUserSubjectId = (
      await subjectRepo.findOneByOrFail({
        private: true,
        createdBy: { id: tstUserId },
      })
    ).id;
    publicSubjectId = (
      await subjectRepo.findOneByOrFail({
        private: false,
        createdBy: { id: Not(In([tstAdminId, tstUserId])) },
      })
    ).id;
  });

  describe("guest user", () => {
    let otherId: number;
    let unownedSubjectId: number;

    beforeEach(async () => {
      sfetch = undefined;
      otherId = tstUserId;
      unownedSubjectId = tstUserSubjectId;
    });

    it("POST /user should fail", async () => {
      const res = await fetch(`${baseUrl}/user`, {
        method: "POST",
        body: Buffer.from(
          JSON.stringify({
            name: "dummy-by-guest",
            password: "mysecretpassword",
            email: "dummy-by-guest@example.com",
            role: RoleName.USER,
          }),
        ),
      });
      expect(res.status).toBe(401);
    });

    it("GET /user should fail", async () => {
      const res = await fetch(`${baseUrl}/user`);
      expect(res.status).toBe(401);
    });

    it("GET /user/{any} should fail", async () => {
      const res = await fetch(`${baseUrl}/user/${otherId}`);
      expect(res.status).toBe(401);
    });

    it("PUT /user/{any} should fail", async () => {
      const res = await fetch(`${baseUrl}/user/${otherId}`, { method: "PUT" });
      expect(res.status).toBe(401);
    });

    it("DELETE /user/{any} should fail", async () => {
      const res = await fetch(`${baseUrl}/user/${otherId}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });

    it("POST /subject should fail", async () => {
      const res = await fetch(`${baseUrl}/subject`, {
        method: "POST",
        body: Buffer.from(
          JSON.stringify({
            private: true,
            key: "test123",
            display_name: "test",
            type: SubjectType.IDEA,
            long_description: "this is a test",
          }),
        ),
      });
      expect(res.status).toBe(401);
    });

    it("GET /subject should succeed", async () => {
      const res = await fetch(`${baseUrl}/subject`);
      expect(res.status).toBe(200);
    });

    it("GET /subject/{public} should succeed", async () => {
      const res = await fetch(`${baseUrl}/subject/${publicSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{private} should fail", async () => {
      const res = await fetch(`${baseUrl}/subject/${unownedSubjectId}`, {
        method: "PUT",
      });
      expect(res.status).toBe(401);
    });

    it("DELETE /subject/{any} should fail", async () => {
      const res = await fetch(`${baseUrl}/subject/${unownedSubjectId}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("regular user", () => {
    let selfId: number;
    let otherId: number;
    let ownedSubjectId: number;
    let unownedSubjectId: number;

    beforeEach(async () => {
      sfetch = await StartSession(baseUrl, "tst_user", "mysecretpassword");
      selfId = tstUserId;
      otherId = tstAdminId;
      ownedSubjectId = tstUserSubjectId;
      unownedSubjectId = tstAdminSubjectId;
    });

    it("POST /user should fail", async () => {
      const res = await sfetch(`/user`, {
        method: "POST",
        body: {
          name: "dummy-by-user",
          password: "mysecretpassword",
          email: "dummy-by-user@example.com",
          role: RoleName.USER,
        },
      });
      expect(res.status).toBe(403);
    });

    it("GET /user should fail", async () => {
      const res = await sfetch("/user");
      expect(res.status).toBe(403);
    });

    it("GET /user/{other} should fail", async () => {
      const res = await sfetch(`/user/${otherId}`);
      expect(res.status).toBe(403);
    });

    it("GET /user/{self} should succeed", async () => {
      const res = await sfetch(`/user/${selfId}`);
      expect(res.status).toBe(200);
    });

    it("PUT /user/{other} should fail", async () => {
      const res = await sfetch(`/user/${otherId}`, { method: "PUT" });
      expect(res.status).toBe(403);
    });

    it("PUT /user/{self} should succeed", async () => {
      const res = await sfetch(`/user/${selfId}`, { method: "PUT" });
      expect(res.status).toBe(200);
    });

    it("DELETE /user/{other} should fail", async () => {
      const res = await sfetch(`/user/${otherId}`, { method: "DELETE" });
      expect(res.status).toBe(403);
    });

    // TODO: will need to create dummy user for deleting
    it.skip("DELETE /user/{self} should fail", async () => {
      const res = await sfetch(`/user/${selfId}`, { method: "DELETE" });
      expect(res.status).toBe(403);
    });

    it("POST /subject should succeed", async () => {
      const res = await sfetch(`/subject`, {
        method: "POST",
        body: {
          private: true,
          key: "test456",
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(res.status).toBe(201);
    });

    it("GET /subject should succeed", async () => {
      const res = await sfetch("/subject");
      expect(res.status).toBe(200);
    });

    it("GET /subject/{owned} should succeed", async () => {
      const res = await sfetch(`/subject/${ownedSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("GET /subject/{unowned} should fail", async () => {
      const res = await sfetch(`/subject/${unownedSubjectId}`);
      expect(res.status).toBe(403);
    });

    it("GET /subject/{public} should succeed", async () => {
      const res = await sfetch(`/subject/${publicSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{owned} should succeed", async () => {
      const res = await sfetch(`/subject/${ownedSubjectId}`, { method: "PUT" });
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{unowned} should fail", async () => {
      const res = await sfetch(`/subject/${unownedSubjectId}`, {
        method: "PUT",
      });
      expect(res.status).toBe(403);
    });

    it("PUT /subject/{public} should fail", async () => {
      const res = await sfetch(`/subject/${publicSubjectId}`, {
        method: "PUT",
      });
      expect(res.status).toBe(403);
    });

    it("DELETE /subject/{owned} should fail", async () => {
      const key = `${RandomName()}-${RandomIntInRange(1000, 9999)}`;
      const createRes = await sfetch(`/subject/`, {
        method: "POST",
        body: {
          private: true,
          key,
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(createRes.status).toBe(201);
      let subject = JSON.parse(createRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      let getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(200);
      subject = JSON.parse(getRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      const res = await sfetch(`/subject/${subject.id}`, { method: "DELETE" });
      expect(res.status).toBe(200);

      getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(404);
    });

    it("DELETE /subject/{unowned} should fail", async () => {
      const res = await sfetch(`/subject/${unownedSubjectId}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(403);
    });

    it("DELETE /subject/{public} should fail", async () => {
      const res = await sfetch(`/subject/${publicSubjectId}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(403);
    });
  });

  describe("admin user", () => {
    let selfId: number;
    let otherId: number;
    let ownedSubjectId: number;
    let unownedSubjectId: number;

    beforeEach(async () => {
      sfetch = await StartSession(baseUrl, "tst_admin", "mysecretpassword");
      selfId = tstAdminId;
      otherId = tstUserId;
      ownedSubjectId = tstAdminSubjectId;
      unownedSubjectId = tstUserSubjectId;
    });

    it("POST /user should succeed", async () => {
      const res = await sfetch(`/user`, {
        method: "POST",
        body: {
          name: "dummy-by-admin",
          password: "mysecretpassword",
          email: "dummy-by-admin@example.com",
          role: RoleName.USER,
        },
      });
      expect(res.status).toBe(201);
    });

    it("GET /user should succeed", async () => {
      const res = await sfetch("/user");
      expect(res.status).toBe(200);
    });

    it("GET /user/{other} should succeed", async () => {
      const res = await sfetch(`/user/${otherId}`);
      expect(res.status).toBe(200);
    });

    it("GET /user/{self} should succeed", async () => {
      const res = await sfetch(`/user/${selfId}`);
      expect(res.status).toBe(200);
    });

    it("PUT /user/{other} should succeed", async () => {
      const res = await sfetch(`/user/${otherId}`, { method: "PUT" });
      expect(res.status).toBe(200);
    });

    it("PUT /user/{self} should succeed", async () => {
      const res = await sfetch(`/user/${selfId}`, { method: "PUT" });
      expect(res.status).toBe(200);
    });

    it("DELETE /user/{other} should succeed", async () => {
      const username = `dummy-by-admin-${RandomIntInRange(1000, 9999)}`;
      const createRes = await sfetch(`/user/`, {
        method: "POST",
        body: {
          name: username,
          password: "mysecretpassword",
          email: `${username}@example.com`,
          role: RoleName.USER,
        },
      });
      expect(createRes.status).toBe(201);
      let user = JSON.parse(createRes.body) as UserDto;
      expect(user.name).toBe(username);

      let getRes = await sfetch(`/user/${user.id}`);
      expect(getRes.status).toBe(200);
      user = JSON.parse(getRes.body) as UserDto;
      expect(user.name).toBe(username);

      const res = await sfetch(`/user/${user.id}`, { method: "DELETE" });
      expect(res.status).toBe(200);

      getRes = await sfetch(`/user/${user.id}`);
      expect(getRes.status).toBe(404);
    });

    // TODO: will need to create dummy user for deleting
    it.skip("DELETE /user/{self} should succeed", async () => {
      const res = await sfetch(`/user/${selfId}`, { method: "DELETE" });
      expect(res.status).toBe(200);
    });

    it("POST /subject should succeed", async () => {
      const res = await sfetch(`/subject`, {
        method: "POST",
        body: {
          private: true,
          key: "test789",
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(res.status).toBe(201);
    });

    it("GET /subject should succeed", async () => {
      const res = await sfetch("/subject");
      expect(res.status).toBe(200);
    });

    it("GET /subject/{owned} should succeed", async () => {
      const res = await sfetch(`/subject/${ownedSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("GET /subject/{unowned} should succeed", async () => {
      const res = await sfetch(`/subject/${unownedSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("GET /subject/{public} should succeed", async () => {
      const res = await sfetch(`/subject/${publicSubjectId}`);
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{owned} should succeed", async () => {
      const res = await sfetch(`/subject/${ownedSubjectId}`, { method: "PUT" });
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{unowned} should succeed", async () => {
      const res = await sfetch(`/subject/${unownedSubjectId}`, {
        method: "PUT",
      });
      expect(res.status).toBe(200);
    });

    it("PUT /subject/{public} should succeed", async () => {
      const res = await sfetch(`/subject/${publicSubjectId}`, {
        method: "PUT",
      });
      expect(res.status).toBe(200);
    });

    it("DELETE /subject/{owned} should succeed", async () => {
      const key = `${RandomName()}-${RandomIntInRange(1000, 9999)}`;
      const createRes = await sfetch(`/subject/`, {
        method: "POST",
        body: {
          private: true,
          key,
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(createRes.status).toBe(201);
      let subject = JSON.parse(createRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      let getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(200);
      subject = JSON.parse(getRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      const res = await sfetch(`/subject/${subject.id}`, { method: "DELETE" });
      expect(res.status).toBe(200);

      getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(404);
    });

    it("DELETE /subject/{unowned} should succeed", async () => {
      const usrFetch = await StartSession(
        baseUrl,
        "tst_user",
        "mysecretpassword",
      );

      const key = `${RandomName()}-${RandomIntInRange(1000, 9999)}`;
      const createRes = await usrFetch(`/subject/`, {
        method: "POST",
        body: {
          private: true,
          key,
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(createRes.status).toBe(201);
      let subject = JSON.parse(createRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      let getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(200);
      subject = JSON.parse(getRes.body) as SubjectDto;
      expect(subject.key).toBe(key);
      expect(subject.createdBy.name).toBe("tst_user");

      const res = await sfetch(`/subject/${subject.id}`, { method: "DELETE" });
      expect(res.status).toBe(200);

      getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(404);
    });

    it("DELETE /subject/{public} should succeed", async () => {
      const usrFetch = await StartSession(
        baseUrl,
        "tst_user",
        "mysecretpassword",
      );

      const key = `${RandomName()}-${RandomIntInRange(1000, 9999)}`;
      const createRes = await usrFetch(`/subject/`, {
        method: "POST",
        body: {
          private: false,
          key,
          display_name: "test",
          type: SubjectType.IDEA,
          tags: [],
          long_description: "this is a test",
        },
      });
      expect(createRes.status).toBe(201);
      let subject = JSON.parse(createRes.body) as SubjectDto;
      expect(subject.key).toBe(key);

      let getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(200);
      subject = JSON.parse(getRes.body) as SubjectDto;
      expect(subject.key).toBe(key);
      expect(subject.createdBy.name).toBe("tst_user");

      const res = await sfetch(`/subject/${subject.id}`, { method: "DELETE" });
      expect(res.status).toBe(200);

      getRes = await sfetch(`/subject/${subject.id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
