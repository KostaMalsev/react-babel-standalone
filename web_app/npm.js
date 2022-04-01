
let packageObj = {};

async function npm(packageJSON) {
  
  resultEl.textContent += 'Loaded package.json\n' + JSON.stringify(packageJSON) + '\n\n';
  
  await getPackages(packageJSON.dependencies, packageObj);
  
  return;
    
}

async function getPackages(packageNames, packageObj) {
  
  if (packageNames && Object.keys(packageNames).length > 0) {
    
    await asyncForEach(packageNames, async (packageName) => {
      
      if (!packageObj[packageName]) {        
        
        const package = await getPackage(packageName, 'latest');
        
        const mainScript = await getMainPackageFile(packageName,
                                                    package.version);
        
        if (package.dependencies) {
                
          getPackages(package.dependencies, packageObj);
    
        }
        
        packageObj[packageName] = mainScript;


        resultEl.textContent += 'Fetched ' + packageName + '\n';
        document.body.scrollTo(0, document.body.scrollHeight);
        
      }
        
    });
    
  }
  
}

async function getPackage(packageName, version) {
  
  let resp = await axios.get('https://registry.npmjs.cf/' + packageName);
  
  if (version === 'latest') return resp.versions[resp['dist-tags'].latest];
  
  return resp.versions[version];
  
}

async function getMainPackageFile(packageName, version) {
  
  const resp = await axios.get('https://cdn.skypack.dev/' +
                               packageName + '@' + version, true);
  
  return resp;
  
}


async function asyncForEach(obj, callback) {
  
  const keys = Object.keys(obj);
  
  for (let index = 0; index < keys.length; index++) {
    
    await callback(keys[index], index, obj);
    
  }
  
}

let axios = {
  'get': (url, noparse) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              
              if (!noparse) resolve(JSON.parse(this.responseText));
              else resolve(this.responseText);
              
            } catch(e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              
              if (!noparse) resolve(JSON.parse(this.responseText));
              else resolve(this.responseText);
              
            } catch(e) {}
          }
        };
        xmlhttp.onerror = function () {
          if (this.responseText) {
            try {
              
              if (!noparse) resolve(JSON.parse(this.responseText));
              else resolve(this.responseText);
              
            } catch(e) {}
          }
        };

        xmlhttp.open('GET', url, true);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};


function getAllScriptsInObj(obj) {

  let result = [];

  goDeeper(obj);

  function goDeeper(obj) {

    for (var key in obj) {

      if (obj[key].constructor.name === 'Object') {

        goDeeper(obj[key]);

      } else if (obj[key]
                 && typeof(obj[key]) === 'string'
                 && obj[key].endsWith('.js')) {

        result.push(obj[key]);

      }

    }

  }
  
  return result;

}

