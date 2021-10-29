/*
 * Instagram Album Cover Mak[i]er (InstaAlCoMie)
 *
 * Creates cover video for Instagram albums,
 * imitating user scrolling to the right.
 *
 * References:
 * https://indd.adobe.com/view/a0207571-ff5b-4bbf-a540-07079bd21d75
 * https://extendscript.docsforadobe.dev
 * https://theiviaxx.github.io/photoshop-docs/Photoshop/Document.html
 * https://ae-scripting.docsforadobe.dev
 * https://github.com/Paul-Riggott/PS-Scripts/blob/master/File%20Stitcher.jsx
 * https://community.adobe.com/t5/photoshop-ecosystem-discussions/i-want-to-know-that-how-to-use-bridge-talk/m-p/7288364
 * https://community.adobe.com/t5/illustrator-discussions/get-path-to-script/td-p/10399382
 *
 */

#target 'bridge'

//onClick function for browse
function browseFile(myEle){
    //opens file selection dialogue
    inputImg = File.openDialog("Select image",function (inputImg){
        //limits file type
        if(inputImg.name.match(/\.(png|jpe{0,1}g|tif{1,2})$/i) || inputImg.constructor.name == "Folder")
        {return true}
        return false
    },false);
    if(inputImg !=null){
        myEle.parent.file.text = decodeURI(inputImg.fsName);
    }
    myEle.parent.imgObj = inputImg;
}

function initUI() {
    var windowTitle = 'InstaAlCoMie';
    var w = new Window('dialog', windowTitle, undefined, {resizeable: true});
    w.orientation = "column";
    w.onResizing = w.onResize = function(){this.layout.resize();}

    var fileFieldSettings = "edittext {alignment: ['fill', 'center'], minimumSize: [220,-1], text:'' ,properties:{multiline:false,noecho:false,readonly:true}}";
    var groupSettings = "group {alignment: ['fill', 'center']}";
    var buttonSettings = "button {alignment: ['right', 'center'], text: 'Browse'}"

    w.inputGroup1 = w.add(groupSettings);
    w.inputGroup1.add("statictext",undefined,"Cover: ");
    w.inputGroup1.file = w.inputGroup1.add(fileFieldSettings);
    w.inputGroup1.browse = w.inputGroup1.add(buttonSettings);

    w.inputGroup2 = w.add(groupSettings);
    w.inputGroup2.add("statictext",undefined,"Next  : ");
    w.inputGroup2.file = w.inputGroup2.add(fileFieldSettings);
    w.inputGroup2.browse = w.inputGroup2.add(buttonSettings);

    w.confirmGroup = w.add(groupSettings);
    w.confirmGroup.process = w.confirmGroup.add("button", undefined, "Process",{name: "OK"});
    w.confirmGroup.cancel = w.confirmGroup.add("button", undefined, "Cancel",{name: "Cancel"});
    w.confirmGroup.alignment = "center",

    //sets onClick browse function for browse
    w.inputGroup1.browse.onClick = w.inputGroup2.browse.onClick = function(){browseFile(this);};

    w.confirmGroup.process.onClick = function() {
        //Throws exception if file not chosen for both fields
        if(w.inputGroup1.file.text == '' || w.inputGroup2.file.text == '') {
            alert("One or more input image not selected!");
            return;
        }
        else{
            //Confirms the user that both images are identical
            if(w.inputGroup1.file.text == w.inputGroup2.file.text){
                if(!confirm("Are you sure you want both images to be identical?")){
                    return;
                }
            }
            //closes window with success code
            w.close(1);
            //starts processing images
            ProcessFiles();
        }
    }

    w.show();
}

function stitchImg(imgCover, imgNext){
    open(File(imgCover),undefined,true);
    appTemp = app.activeDocument;
    appCover = appTemp.duplicate(File(imgCover).name+"-stitch");
    appTemp.close(SaveOptions.DONOTSAVECHANGES);
    open(File(imgNext),undefined,true);
    appTemp = app.activeDocument;
    appNext = appTemp.duplicate(File(imgCover).name+"-stitchNext");
    appTemp.close(SaveOptions.DONOTSAVECHANGES);
    var wNext = appNext.width,
    hNext = appNext.height,
    wCover = appCover.width,
    hCover = appCover.height,
    sq = Math.max(wNext, hNext, wCover, hCover);
    appNext.resizeImage(sq,sq,this.reolution);
    appNext.selection.selectAll();
    streamNext = appNext.selection.copy();
    appNext.selection.deselect();
    appNext.close(SaveOptions.DONOTSAVECHANGES);
    appCover.resizeImage(sq,sq,this.reolution);
    appCover.resizeCanvas(sq*2, sq, AnchorPosition.MIDDLELEFT);
    if(!appCover.activeLayer.isBackgroundLayer){
        appCover.activeLayer.isBackgroundLayer=true;
    }
    appCover.selection.select([[sq,0],[sq*2,0],[sq*2,sq],[sq,sq]], SelectionType.REPLACE, 0, false);
    appCover.paste(true);
    appCover.selection.deselect();
    appCover.mergeVisibleLayers();
    
    appCover.saveAs(outputDir);
    appCover.close(SaveOptions.SAVECHANGES);
    
    return true.toSource();
}

function animateStitch(stitched){
    alert(stitched);
}

function createDir(outputDir){
    //Create dir
    var f = new Folder(outputDir);
    var created = false;
    do{
        if (!f.exists)
            created = f.create();
        else{
            outputDir += "_copy";
            f = new Folder(outputDir);
        }
    }while(!created);
    return [f, outputDir]
}

function PSEdit(f, img1, img2){
    //new bridgeTalk to Photoshop
    var btPS = new BridgeTalk();
    //sets btPS target to PS
    btPS.target = "photoshop";
    //executes stitch script
    btPS.body = "var imgCover = " + File(img1).toSource() + ",\nimgNext = " + File(img2).toSource() + ",\noutputDir = " + f.toSource() + ",\nmyFunc = " + stitchImg.toSource() + ";\nmyFunc(imgCover, imgNext);";
    
    btPS.onResult = function(inBT) {eval(inBT.body);}
    btPS.onError = function(inBT) {alert(inBT.body);}
    
    BridgeTalk.bringToFront(btPS);
    btPS.send(-1);
}

function AEEdit(f){
    var stitchedPsd = f.getFiles(/\.psd$/i)[0];
    //new bridgeTalk to AfterEffects
     var btAE = new BridgeTalk();
     //sets btAE target to AE
     btAE.target = "aftereffects";
     //executes stitch script
     btAE.body = "var stitched = " + stitchedPsd.toSource() + ";\nmyFunc = " + animateStitch.toSource() + ";\nmyFunc(stitched);";
     
     btAE.onResult = function(inBT) {eval(inBT.body);}
     btAE.onError = function(inBT) {alert(inBT.body);}
     
     BridgeTalk.bringToFront(btAE);
     btAE.send(-1);
}

function ProcessFiles(){
    //exits if not both images found
    if(w.inputGroup1.file.text == '' || w.inputGroup2.file.text == ''){return;}
    
    var scriptFile = new File($.fileName);
    var scriptPath = scriptFile.parent.fsName;
    var imgName = File(w.inputGroup1.imgObj).name.match(/^.+(?=\..+$)/);
    
    var outputDir = scriptPath + '/output/cover_' + imgName;

    var temp = createDir(outputDir),
    f = temp[0],
    outputDir = temp[1];

    PSEdit(f, w.inputGroup1.imgObj, w.inputGroup2.imgObj);    
    
    AEEdit(f);
}

function main(){
    if(!BridgeTalk.getSpecifier("photoshop")){
        alert("PhotoShop is not installed.");
        return;
    }
    if(!BridgeTalk.getSpecifier("aftereffects")){
        alert("After Effects is not installed.");
        return;
    }

    initUI();
}

main();