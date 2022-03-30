
let packageObj = {};

async function npm(packageJSON) {
    
  await getPackages(packageJSON.dependencies, packageObj);
  
  return packageObj;
  
}

async function getPackages(packageNames, packageObj) {
  
  if (packageNames && Object.keys(packageNames).length > 0) {
    
    await asyncForEach(packageNames, async (packageName) => {
      
      if (!packageObj[packageName]) {
        
        const package = await getPackage(packageName, 'latest');
        
        //console.log('got', packageName, package);
        
        //console.log('fetching', packageName, package);
        
        let mainScript = '';
        
        if (package.types) {
          
          console.log('found types in', packageName);
          
        } else if (package.exports) {
          
          console.log('found', Object.keys(package.exports).length, 'exports in', packageName);
          
        } else if (package.files) {
                  
          if (package.files.length > 1
              && package.files.includes('index.js')) {
            
            mainScript = 'index.js';
            
          } else {
            
            package.files.forEach(file => {
              
              if (file.endsWith('.js')) mainScript = file;
              
            });
            
          }
          
          //console.log('found main script "'+ mainScript +'" in files of', packageName);
          
        } else if (package.main) {
          
          //console.log('found main script "' + package.main + '" in', packageName);
          
          mainScript = package.main;
          
        } else {
          
          //console.log('assuming main script "index.js" for', packageName);
          
          mainScript = 'index.js';
          
        }
        
        if (mainScript) {
        
          mainScript = await getPackageFile(mainScript,
                                            packageName,
                                            package.version);
          
          if (package.dependencies) {
            
            //console.log('got', packageName, 'getting', Object.keys(package.dependencies).length, 'dependencies');
        
            getPackages(package.dependencies, packageObj);
            
          }
          
        } else {
          
          mainScript = package;
          
        }
        
        packageObj[packageName] = mainScript;
        
      }
        
    });
    
  }
  
}

async function getPackage(packageName, version) {
  
  let resp = await axios.get(cors + 'https://registry.npmjs.org/' + packageName);
  
  if (version === 'latest') return resp.versions[resp['dist-tags'].latest];
  
  return resp.versions[version];
  
}

async function getPackageFile(fileName, packageName, version) {
  
  const resp = await axios.get('https://unpkg.com/' +
                               packageName + (version ? ('@' + version) : '') +
                               '/' + fileName, true);
  
  return resp;
  
}


async function asyncForEach(obj, callback) {
  for (let index = 0; index < Object.keys(obj).length; index++) {
    await callback(Object.keys(obj)[index], index, obj);
  }
}

const cors = 'https://scepter-cors2.herokuapp.com/';

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

