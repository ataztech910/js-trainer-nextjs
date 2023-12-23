const fs = require('fs');
const fsAsync = require('fs/promises');
const args = process.argv;

const root = `lessons/`;
const projectFolder = `./${root}${args[2]}`;
let json = {};

const readFileData = (dir, file) => {
    try {
        return fs.readFileSync(`${dir}/${file}`, 'utf8');
    } catch (err) {
        console.error(err);
    }
}


function produceFileData(directory, file) {
    return {
        [file]: {
            'file': {
                'contents': readFileData(directory, file),
            },
        }
    }
}

function getDirectoryData(directoryArray, file) {
    let directoryData = {};
    let lastItem = directoryArray[0];
    for(let i = 0; i < directoryArray.length; i++) {
        if (!json.filesData[lastItem]) {
            json.filesData[lastItem] = { directory: {} } ;
        }
        if(i === 0) {
            directoryData[directoryArray[i]] = {
                ...directoryData[directoryArray[i]],
                ...json.filesData[directoryArray[i]]
            };
        } else {
            directoryData[lastItem].directory[directoryArray[i]] = {
                ...directoryData[lastItem].directory[directoryArray[i]],
                ...json.filesData[directoryArray[i]]
            };
        }
        if (i > 0 && i === directoryArray.length - 1) {
            directoryData[lastItem].directory[directoryArray[i]].directory = {
                    ...directoryData[lastItem].directory[directoryArray[i]].directory,
                    ...file
            }
        } else if(i === 0 && i === directoryArray.length - 1) {
            directoryData[lastItem].directory = {
                ...directoryData[lastItem].directory,
                ...file
            };
        }

        lastItem = directoryArray[i];
    }
    return directoryData;
}

function getFoldersArray(folderString) {
    let intFolderString = folderString;
    const localProjectFolder = projectFolder.replace("./", '');
    intFolderString = intFolderString.replaceAll("\/", '/');
    intFolderString = intFolderString.replaceAll("\\", '/');
    intFolderString = intFolderString.replaceAll("./", '');
    intFolderString = intFolderString.replace(localProjectFolder, '');
    return intFolderString.length > 0 ? intFolderString.split('/') : null;
}

async function getFiles(dir) {
    return await fsAsync.readdir(dir, { recursive: true, withFileTypes: true });
}

getFiles(projectFolder).then(result => {
    json.filesData = {};
    result.forEach(file => {
        const stat = fs.statSync(file.path + '/' + file.name);
        if(!stat.isDirectory()) {
            const dir = getFoldersArray(file.path);
            if(dir === null) {
                json.filesData = { ...json.filesData, ...produceFileData(file.path, file.name) };
            } else {
                dir.shift();
                json.filesData = { ...json.filesData , ...getDirectoryData(dir, produceFileData(file.path, file.name)) };
            }

        }
    });

    json['pathToMainFile'] = args[3];
    json['mainFile'] = args[4];
    json['runCommand'] = args[5];
    json['platform'] = args[6];

    try {
        fs.writeFileSync(`${root}${args[2]}.json`, JSON.stringify(json));
        console.log(`Lesson created in : ${root}${args[2]}.json`)
    } catch (e) {
        console.error(e);
    }
});
