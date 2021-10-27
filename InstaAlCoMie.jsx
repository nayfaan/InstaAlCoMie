/*
 * Instagram Album Cover Mak[i]er (InstaAlCoMie)
 *
 * Creates cover video for Instagram albums,
 * imitating user scrolling to the right.
 *
 * References: https://indd.adobe.com/view/a0207571-ff5b-4bbf-a540-07079bd21d75
 */
#target 'bridge'
#targetengine 'session';

var windowTitle = 'InstaAlCoMie';
var w = new Window('dialog', windowTitle, undefined, {resizeable: true});
w.orientation = "column";

var fileFieldSettings = "edittext {alignment: ['fill', 'center'], minimumSize: [220,-1], text:'' ,properties:{multiline:false,noecho:false,readonly:true}}";
var browseText = "Browse"

w.inputGroup1 = w.add("group");
w.inputGroup1.add("statictext",undefined,"Cover: ");
w.inputGroup1.file = w.inputGroup1.add(fileFieldSettings);
w.inputGroup1.browse = w.inputGroup1.add("button",undefined, browseText);

w.inputGroup2 = w.add("group");
w.inputGroup2.add("statictext",undefined,"Next  : ");
w.inputGroup2.file = w.inputGroup2.add(fileFieldSettings);
w.inputGroup2.browse = w.inputGroup2.add("button",undefined, browseText);

w.confirmGroup = w.add("group");
w.confirmGroup.process = w.confirmGroup.add("button", undefined, "Process",{name: "OK"});
w.confirmGroup.cancel = w.confirmGroup.add("button", undefined, "Cancel",{name: "Cancel"});

//sets onClick browse function for browse
w.inputGroup1.browse.onClick = w.inputGroup2.browse.onClick = function(){browseFile(this)};

//onClick function for browse
function browseFile(myEle) {
    //opens file selection dialogue
    inputImg = File.openDialog("Select the cover image",function (inputImg){
        //limits file type
     if(inputImg.name.match(/\.png$/i) || inputImg.name.match(/\.jpe{0,1}g$/i) || inputImg.name.match(/\.tiff$/i))
        {return true}
     return false
 },false);
    if(inputImg !=null){
        myEle.parent.file.text =  decodeURI(inputImg.fsName);
        }
}

w.onResizing = w.onResize = function(){this.layout.resize();}

w.onShow = function(){
    w.minimumSize = w.size;
}

w.show();
