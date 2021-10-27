/*
 * Instagram Album Cover Mak[i]er (InstaAlCoMie)
 *
 * Creates cover video for Instagram albums,
 * imitating user scrolling to the right.
 *
 * References:
 * https://indd.adobe.com/view/a0207571-ff5b-4bbf-a540-07079bd21d75
 * https://extendscript.docsforadobe.dev
 * https://github.com/Paul-Riggott/PS-Scripts/blob/master/File%20Stitcher.jsx
 * https://community.adobe.com/t5/photoshop-ecosystem-discussions/i-want-to-know-that-how-to-use-bridge-talk/m-p/7288364
 */

#target 'bridge'
//#targetengine 'session'; //needed for palette

var windowTitle = 'InstaAlCoMie';
var w = new Window('dialog', windowTitle, undefined, {resizeable: true});
w.orientation = "column";

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



//onClick function for browse
function browseFile(myEle){
    //opens file selection dialogue
    inputImg = File.openDialog("Select the cover image",function (inputImg){
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

w.onResizing = w.onResize = function(){this.layout.resize();}

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
        //debug();
        //closes window with success code
        w.close(1);
        //starts processing images
        ProcessFiles();
    }
}

Image.prototype.onDraw = function(){
    if(!this.image) return;
    var WH = this.size,
    wh = this.image.size,
    k = Math.min(WH[0]/wh[0], WH[1]/wh[1]),
    xy;

    wh = [k*wh[0],k*wh[1]];
    
    xy = [(WH[0] - wh[0])/2,(WH[1] - wh[1])/2];
    this.graphic.drawImage(this.image, xy[0], xy[1], wh[0], wh[1]);
    WH=wh=xy=null;
}

function debug(){
    try{
        w.debugGroup = w.add(groupSettings);
    w.debugGroup.add("statictext",undefined,"Debug: ");
    w.debugGroup.img1 = w.debugGroup.add("image",undefined,File(w.inputGroup1.imgObj));
    w.debugGroup.img2 = w.debugGroup.add("statictext",undefined,File(w.inputGroup2.imgObj));
        
    //w.debugGroup.img1.size = w.debugGroup.img2.size = [50,50];
    w.layout.layout(true);
    }catch(e) {
        alert("debug: ",e);
    }
}

w.show();

function stitchImg(imgCover, imgNext){
    open(File(imgCover),undefined,true)
    try{app.activeDocument.duplicate(File(imgCover).name.match(/(.*)\.[^\.]+$/)[1]+"-stitch");}catch(e){alert("dup:", e);}
    try{app.documents[0].close(SaveOptions.DONOTSAVECHANGES);}catch(e){alert("close:", e);}
}

function ProcessFiles(){
    //exits if not both images found
    if(w.inputGroup1.file.text == '' || w.inputGroup2.file.text == ''){return;}
    
    /*if (!BridgeTalk.isRunning("photoshop")){
        BridgeTalk.launch("photoshop");
    }*/
    
    try{
        //new bridgeTalk to Photoshop
    var btPS = new BridgeTalk();
    //sets btPS target to PS
    btPS.target = "photoshop";
    //executes stitch script
    btPS.body = "var imgCover = " + File(w.inputGroup1.imgObj).toSource() + ",\nimgNext = " + File(w.inputGroup2.imgObj).toSource() + ",\nmyFunc = " + stitchImg.toSource() + ";\nmyFunc(imgCover, imgNext);";
        
    btPS.onResult = function( inBT ) { result = eval( inBT.body ); }
    btPS.onError = function( inBT ) {alert(inBT.body); }
        
    btPS.send(0.1);
        
    }catch(e){
        
        alert("P2: ", e);
        return;
    }
}
