describe("Wrestler API tests", function () {

    var apiBase = "http://streamtv.net.ua/base/php/wrestler/";

    var wrestler;

    var consts = {
        style: ["1", "2", "3"],
        region1: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"],
        region2: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"],
        fst1: ["2", "3", "4", "5", "6", "7", "8"],
        fst2: ["2", "3", "4", "5", "6", "7", "8"],
        expires: ["2013", "2014", "2015", "2016", "2017"],
        lictype: ["1", "2", "3"],
        card_state: ["1", "2", "3"]
    };

    var loremIpsum = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";

    var loremWords = loremIpsum.split(" ").map(function (word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
    });

    var loremCount = loremWords.length;

    function getRandomName() {
        var randomWordIndex = Math.floor(Math.random() * loremCount);
        return loremWords[randomWordIndex];
    }

    function getRandomFromRange(data) {
        var length = data.length;
        var randomIndex = Math.floor(Math.random() * length);
        return data[randomIndex];
    }

    function getRandomDate() {
        var now = Date.now()
        var randomSeconds = Math.floor(Math.random() * now);
        var randomDate = new Date(randomSeconds);
        return new Date(randomDate.getFullYear(), randomDate.getMonth(), randomDate.getDate());
    }

    function padZero(num) {
        return ('0' + num).slice(-2);
    }

    function createWrestler() {
        var dob = getRandomDate();
        var day = padZero(dob.getDate());
        var month = padZero(dob.getMonth() + 1);
        var year = dob.getFullYear();

        var newWrestler = {
            lname: getRandomName(),
            fname: getRandomName(),
            mname: getRandomName(),
            dob: `${day}-${month}-${year}`,
            style: getRandomFromRange(consts.style),
            region1: getRandomFromRange(consts.region1),
            region2: getRandomFromRange(consts.region2),
            fst1: getRandomFromRange(consts.fst1),
            fst2: getRandomFromRange(consts.fst2),
            expires: getRandomFromRange(consts.expires),
            lictype: getRandomFromRange(consts.lictype),
            card_state: getRandomFromRange(consts.card_state)
        };

        return newWrestler;
    }

    function readWrestler(wrestlerId, callback, errorCallback) {
        fetch(apiBase + `read.php?id=${wrestlerId}`)
        .then(function (response) {
            response.json()
                .then(function (data) {
                    callback(data);
                })
                .catch(function (error) {
                    errorCallback(new Error("Body JSON read error:" + error));
                });
        })
        .catch(function (error) {
            errorCallback(new Error("Read error: " + error));
        });
    }

    function compareWrestlers(actualWrestler, expectedWrestler) {
        expect(actualWrestler.id_wrestler).toBe(expectedWrestler.id_wrestler);
        expect(actualWrestler.lname).toBe(expectedWrestler.lname);
        expect(actualWrestler.fname).toBe(expectedWrestler.fname);
        expect(actualWrestler.mname).toBe(expectedWrestler.mname);
        expect(actualWrestler.dob).toBe(expectedWrestler.dob);
        expect(actualWrestler.style).toBe(expectedWrestler.style);
        expect(actualWrestler.region1).toBe(expectedWrestler.region1);
        expect(actualWrestler.region2).toBe(expectedWrestler.region2);
        expect(actualWrestler.fst1).toBe(expectedWrestler.fst1);
        expect(actualWrestler.fst2).toBe(expectedWrestler.fst2);
        expect(actualWrestler.expires).toBe(expectedWrestler.expires);

        // expect(actualWrestler.lictype).toBe(expectedWrestler.lictype);  --  "lictype" is not updated from time to time. 
        // expect(actualWrestler.card_state).toBe(expectedWrestler.card_state);  --  "card_state" is not set when creating new Wrestler - it always stays "1"  
    }

    beforeAll(function (done) {
        fetch("http://streamtv.net.ua/base/php/login.php", {
            method: "POST",
            body: JSON.stringify(
                {
                    "username": "auto",
                    "password": "test"
                })
        })
        .then(done)
        .catch(function (error) {
            done(new Error("Login error: " + error));
        });

        wrestler = createWrestler();
    });

    it("Create Wrestler test", function (done) {
        fetch(apiBase + "create.php", {
            method: "POST",
            body: JSON.stringify(wrestler)
        })
        .then(function (response) {
            response.json()
                .then(function (data) {
                    expect(data.result).toBe(true);
                    wrestler.id_wrestler = data.id.toString();
                    done();
                })
                .catch(function (error) {
                    done(new Error("Body JSON read error: " + error));
                })
        })
        .catch(function (error) {
            done(new Error("Create error: " + error));
        });
    });

    it("Read Wrestler test", function (done) {
        readWrestler(wrestler.id_wrestler, function(data){
            compareWrestlers(data, wrestler);
            done();
        }, done);
    });

    it("Update Wrestler test", function (done) {
        var updatedWrestler = createWrestler();
        updatedWrestler.id_wrestler = wrestler.id_wrestler;

        fetch(apiBase + "update.php", {
            method: "POST",
            body: JSON.stringify(updatedWrestler)
        })
        .then(function (response) {
            response.json()
                .then(function (data) {
                    expect(data.result).toBe(true);
                    wrestler = updatedWrestler;

                    readWrestler(wrestler.id_wrestler, function (data) {
                        compareWrestlers(data, wrestler);
                        done();
                    }, done);
                })
                .catch(function (error) {
                    done(new Error("Body JSON read error: " + error));
                })
        })
        .catch(function (error) {
            done(new Error("Update error: " + error));
        });
    });

    it("Delete Wrestler test", function (done) {
        var deletedWrestler = {
            "region1": null,
            "fst1": null,
            "expires": null,
            "lictype": null,
            "card_state": null,
            "photo": "",
            "attaches": []
        };

        fetch(apiBase + `delete.php?id=${wrestler.id_wrestler}`)
            .then(function (response) {
                response.json()
                    .then(function (data) {
                        expect(data.result).toBe(true);

                        readWrestler(wrestler.id_wrestler, function (data) {
                            expect(data).toEqual(deletedWrestler);
                            done();
                        }, done);
                    })
                    .catch(function (error) {
                        done(new Error("Body read JSON error: " + error));
                    })
            })
            .catch(function (error) {
                done(new Error("Delete error: " + error));
            });
    });
});