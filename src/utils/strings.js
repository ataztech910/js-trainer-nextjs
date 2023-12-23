const pathToKey = (pathToSplit, mainFile, files) => {
    console.log({
        pathToSplit, mainFile, files
    })
    const path = pathToSplit.split('/');
    let resultObject = null;
    if(pathToSplit === '/') {
        return files[mainFile]
    }
    for(let i = 0; i< path.length; i++) {
        if(i === 0) {
            resultObject = files[path[i]];
        } else {
            resultObject = resultObject[path[i]]
        }
    }
    return resultObject[mainFile];
};

export { pathToKey };