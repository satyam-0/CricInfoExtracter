// the purpose of this project is to extract informatin of worldcup 2019 from cricinfo and present
// that in thr form in the exel and pdf scorecards
// the real purpose is to learn how to extract information and get experience with js
// a very good reason to ever make a project is to have good fun

// npm init -y
// npm install minimist
// npm install axios
// npm install jsdom
// npm install excel4node
// npm install path
// npm install pdf-lib

// 1st node_Project_WorldCup2019.js --excel=WorldCup.csv --dataDir=Worldcup --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results

let minimist = require("minimist");
let fs = require("fs");
let axios = require("axios");
let jsdom = require("jsdom");
let excel = require("excel4node");
let path = require("path");
let pdf = require("pdf-lib");

let args = minimist(process.argv);

// download using axios
// extract information using jsdom
// manupulate data using array function
// save in excel using excel4node
// create folders and make pdf 
//
//

let responseKaPromise = axios.get(args.source);

responseKaPromise.then(function(response) {
        let html = response.data;
        //console.log(html);
        let dom = new jsdom.JSDOM(html);
        let document = dom.window.document;

        let matchScoreDivs = document.querySelectorAll("div.match-score-block");
        console.log(matchScoreDivs.length);
        let matches = [];
        for (let i = 0; i < matchScoreDivs.length; i++) {
            let matchDiv = matchScoreDivs[i];
            match = {
                t1: "",
                t2: "",
                t1s: "",
                t2s: "",
                result: "",
                place: ""
            }

            let teamParse = matchDiv.querySelectorAll("div.name-detail > p.name");
            match.t1 = teamParse[0].textContent;

		match.t2 = teamParse[1].textContent;

            let scoreSpan = matchDiv.querySelectorAll("div.score-detail > span.score");
            if (scoreSpan.length == 2) {
                match.t1s = scoreSpan[0].textContent;
                match.t2s = scoreSpan[1].textContent;
            } else if (scoreSpan.length == 1) {
                match.t1s = scoreSpan[0].textContent;
                match.t2s = "";
            } else {
                match.t1s = "";
                match.t2s = "";
            }

            let resultSpan = matchDiv.querySelector("div.status-text > span");
            match.result = resultSpan.textContent;

            let placeDescription = matchDiv.querySelector("div.description");
            match.place = placeDescription.textContent;

            matches.push(match);
            let matchesKaJSON = JSON.stringify(matches);
            fs.writeFileSync("matches.json", matchesKaJSON, "utf-8");
        }
        //console.log(matches);

        // put team in teams if not already there
        teams = [];
        for (let i = 0; i < matches.length; i++) {
            pushTeamInTeamsIfNotAlreadyThere(teams, matches[i].t1);
            pushTeamInTeamsIfNotAlreadyThere(teams, matches[i].t2);
        }

        // push match at appropreat place
        for (let i = 0; i < matches.length; i++) {
            pushMatchInAppropriatTeam(teams, matches[i].t1, matches[i].t2, matches[i].t1s, matches[i].t2s, matches[i].result);
            pushMatchInAppropriatTeam(teams, matches[i].t2, matches[i].t1, matches[i].t2s, matches[i].t1s, matches[i].result);
        }
        //console.log(teams);
        let teamsKaJSON = JSON.stringify(teams);
        fs.writeFileSync("teams.json", teamsKaJSON, "utf-8");

        prepareExcel(teams, args.excel);
        prepareFolderAndPdfs(teams, args.dataDir);

    }) //.catch(function() {
    //console.log("error");


function prepareFolderAndPdfs(teams, dataDir) {
    if (fs.existsSync(dataDir) == true) {
        fs.rmdirSync(dataDir, { recursive: true });
    }
    fs.mkdirSync(dataDir);

    for (let i = 0; i < teams.length; i++) {
        let teamFolderName = path.join(dataDir, teams[i].name);
        if (fs.existsSync(teamFolderName) == false) {
            fs.mkdirSync(teamFolderName);
        }

        for (let j = 0; j < teams[i].matches.length; j++) {
            let match = teams[i].matches[j];
            createMatchScoreCardPDF(teamFolderName, teams[i].name, match);
        }
    }

}

function createMatchScoreCardPDF(teamFolderName, homeTeam, match) {
    let matchFileName = path.join(teamFolderName, match.vs);
    //fs.writeFileSync(matchFileName, "", "utf-8");
    let tamplateFileBytes = fs.readFileSync("Template.pdf");
    let pdfDocKaPromise = pdf.PDFDocument.load(tamplateFileBytes);
    pdfDocKaPromise.then(function(pdfdoc) {
        let page = pdfdoc.getPage(0);

        page.drawText(homeTeam, {
            x: 310,
            y: 628,
            size: 12
        });
        page.drawText(match.vs, {
            x: 310,
            y: 607,
            size: 12
        });
        page.drawText(match.selfScore, {
            x: 310,
            y: 585,
            size: 12
        });
        page.drawText(match.oppScore, {
            x: 310,
            y: 562,
            size: 12
        });
        page.drawText(match.result, {
            x: 310,
            y: 540,
            size: 12
        });


        let changedBytesKaPromise = pdfdoc.save();
        changedBytesKaPromise.then(function(chanedBytes) {
            if (fs.existsSync(matchFileName + ".pdf") == true) {
                fs.writeFileSync(matchFileName + "1.pdf", chanedBytes);
            } else {
                fs.writeFileSync(matchFileName + ".pdf", chanedBytes);
            }

        })
    });
}

function prepareExcel(teams, excelFileName) {
    let wb = new excel.Workbook();

    for (let i = 0; i < teams.length; i++) {
        let teamSheet = wb.addWorksheet(teams[i].name);

        teamSheet.cell(1, 1).string("Vs")
        teamSheet.cell(1, 2).string("Self Score")
        teamSheet.cell(1, 3).string("Opp Score")
        teamSheet.cell(1, 4).string("Result")
        for (let j = 0; j < teams[i].matches.length; j++) {
            teamSheet.cell(2 + j, 1).string(teams[i].matches[j].vs)
            teamSheet.cell(2 + j, 2).string(teams[i].matches[j].selfScore)
            teamSheet.cell(2 + j, 3).string(teams[i].matches[j].oppScore)
            teamSheet.cell(2 + j, 4).string(teams[i].matches[j].result)
        }
    }
    //wb.write("Excel.xlsx");
    wb.write(excelFileName);
}

function pushMatchInAppropriatTeam(teams, homeTeam, oppTeam, homeScore, oppScore, result) {
    let tidx = -1;
    for (let j = 0; j < teams.length; j++) {
        if (teams[j].name == homeTeam) {
            tidx = j;
            break;
        }
    }
    let team = teams[tidx];
    team.matches.push({
        vs: oppTeam,
        selfScore: homeScore,
        oppScore: oppScore,
        result: result
    })
}

function pushTeamInTeamsIfNotAlreadyThere(teams, teamName) {
    let tidx = -1;
    for (let j = 0; j < teams.length; j++) {
        if (teams[j].name == teamName) {
            tidx = j;
            break;
        }
    }
    if (tidx == -1) {
        let team = {
            name: teamName,
            matches: []
        }
        teams.push(team);
    }
}
