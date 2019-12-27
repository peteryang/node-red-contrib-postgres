const should = require("should");
const helper = require("node-red-node-test-helper");

const node = require("../postgres");

const ps_hostname = process.env.PS_HOSTNAME;
const ps_port = process.env.PS_PORT;
const ps_db = process.env.PS_DB;
const ps_user = process.env.PS_DB;
const ps_password = process.env.PS_PASSWORD;

describe("Postgres Node", () => {
    before((done) => {
        helper.startServer(done);
    });

    after((done) => {
        helper.stopServer(done);
    });

    afterEach(() => {
        helper.unload();
    });

    it("should be loaded", (done) => {
        let flow = [{id:"n1", type:"postgres", name: "test" }];
        helper.load(node, flow, () => {
            const n1 = helper.getNode("n1");
            n1.should.have.property("name", "test");
            done();
        });
    });

    it("select table is success", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "success");
                done();
            });
            n1.receive({payload: "SELECT * FROM table1"});
        });
    });

    it("msg.payload is empty", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n1 = helper.getNode("n1");
            n1.on("call:error", (msg) => {
                msg.args[0].should.equal("postgres.errors.payload");
                done();
            });
            n1.receive({});
        });
    });

    it("get credntial return success", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            helper.request().get("/postgresdb/db").end((err, res) => {
                const result = JSON.parse(res.text);
                result.should.have.property("user", ps_user);
                result.should.have.property("hasPassword", true);
                done();
            });
        });
    });

    it("get credntial return empty", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            helper.request().get("/postgresdb/db").end((err, res) => {
                const result = JSON.parse(res.text);
                result.should.empty();
                done();
            });

        });
    });

    it("post credntial ok", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            helper.request().post("/postgresdb/db")
                .send('user=user')
                .send('password=passowrd')
                .set('Accept', 'application/json')
                .end( (err,res) => {
                    res.should.have.property("status",200);
                    done();
                });
        });
    });

    it("post credntial (user is null)", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            helper.request().post("/postgresdb/db")
                .send('password=passowrd')
                .set('Accept', 'application/json')
                .end( (err,res) => {
                    res.should.have.property("status",200);
                    done();
                });
        });
    });

    it("post credntial (password is empty)", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            helper.request().post("/postgresdb/db")
                .send('user=user')
                .send('password=')
                .set('Accept', 'application/json')
                .end( (err,res) => {
                    res.should.have.property("status",200);
                    done();
                });
        });
    });

    it("delete credntial", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            helper.request().delete("/postgresdb/db").expect(200,done);
        });
    });

    it("sql error", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "error");
                done();
            });
            n1.receive({payload: "SELECT * FROM table9999"});
        });
    });

    it("hostname is empty", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname:"", port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "error");
                done();
            });
            n1.receive({payload: "SELECT * FROM table1"});
        });
    });

    it("port is error", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname: ps_hostname, port: 80, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "error");
                done();
            });
            n1.receive({payload: "SELECT * FROM table1"});
        });
    });

    it("db is empty", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname: ps_hostname, port: ps_port, db: "", ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        let credntial = {
            db: {
                user: ps_user,
                password: ps_password
            }
        };
        helper.load(node, flow, credntial, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "error");
                done();
            });
            n1.receive({payload: "SELECT * FROM table1"});
        });
    });

    it("credntial is empty", (done) => {
        let flow = [
            { id: "db", type: "postgresdb", hostname: ps_hostname, port: ps_port, db: ps_db, ssl:false},
            { id: "n1", type: "postgres", postgresdb: "db", name:"","wires":[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        helper.load(node, flow, () => {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            n2.on("input", (msg) => {
                msg.should.have.property("status", "error");
                done();
            });
            n1.receive({payload: "SELECT * FROM table1"});
        });
    });

});
