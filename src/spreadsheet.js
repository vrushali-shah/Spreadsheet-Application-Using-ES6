import {computeAll,operate,operators,getter,regex,numb_regx,alph_regx,arithmetic_regx} from './calculation.js';
window.cellMap=new Map();

class CellDetails{
	//attribute for ensuring whether a cell is visited and its last calculated value
    constructor(id){
        this.id=id;
        this.value="";
        this.calc_value="";
        this.visited=false;
    }
}

//default size of table odisplayed on browser loading
var table=document.getElementById("dynamic-table");
for (var i=0; i<3; i++) {
    var rows = table.insertRow(-1);
    for (var j=0; j<3; j++) {
		//attach unique ID to each table cell
        var alphabet = String.fromCharCode("A".charCodeAt(0)+j-1);
		var inputchild=document.createElement("input");
        inputchild.id=alphabet+i;
		if(i&&j){
			rows.insertCell(-1).appendChild(addListerners(inputchild));
		}else{
			rows.insertCell(-1).appendChild(document.createTextNode(i||alphabet));
		}
    }
};
var all_rows=document.getElementsByTagName("tr"),
    all_cols=all_rows[0].getElementsByTagName("td"),
	add_row=document.getElementById("add-row"),
    sub_row=document.getElementById("sub-row"),
    add_col=document.getElementById("add-col"),
    sub_col=document.getElementById("sub-col");

//function to add new row at the bottom of the existing table
add_row.addEventListener('click',function(evt){
let row=table.insertRow(-1);
    for (var j=0; j<all_cols.length; j++) {
        let alphabet = String.fromCharCode("A".charCodeAt(0)+j-1);
        var inputchild=document.createElement("input");
         inputchild.id=alphabet+(all_rows.length-1);
		 if((all_rows.length-1)&&j){
			row.insertCell(-1).appendChild(addListerners(inputchild));
		 }else{
			row.insertCell(-1).appendChild(document.createTextNode(all_rows.length-1)||alphabet);
	 	}
    }
	computeAll();
});

//function to delete an existing row from the bottom of the table
sub_row.addEventListener('click',function(evt){
   
    if(all_rows.length!==2){
    let tbody=document.querySelector("tbody");
    let lastChild=tbody.removeChild(all_rows.item(all_rows.length-1));
        cellMap.delete(lastChild.firstChild.id);
    }
	computeAll();
});
        
//function to add new column at the right of the existing table
add_col.addEventListener('click',function(evt){

    let rows=document.querySelectorAll("tr");
    let alphabet = String.fromCharCode("A".charCodeAt(0)+all_cols.length-1);
	Array.from(all_rows).forEach(function(column,index){
		var inputchild=document.createElement("input");
		inputchild.id=alphabet+index ;
		if(index&&(all_cols.length-1)){
			column.insertCell(-1).appendChild(addListerners(inputchild));
		}else{
				column.insertCell(-1).appendChild(document.createTextNode(index||alphabet));
		}
    });
	computeAll();
});

//function to delete an existing column from the right of the table    
sub_col.addEventListener('click',function(evt){
    if(all_cols.length!==2){
      Array.from(all_rows).forEach(function(row,index){
      let lastChild=row.removeChild(row.lastChild);
          cellMap.delete(lastChild.firstChild.id);
		}); 
	}
	computeAll();	
});

function addListerners(i){
    addListernerToInputs(i);
    return i;
}

//show cell content when on focus and blur
//difference seen when cell is provided with the regex to perform algebraic operation
function addListernerToInputs(elm){
    elm.addEventListener('focus',function(evt){
       evt.target.value=cellMap.get(this.id).value||"";
   });
    elm.addEventListener('blur',function(evt){
        cellMap.get(this.id).value=this.value;
        if(this.value.includes(this.id) || this.value.includes(this.id.toLowerCase()))
            evt.target.focus(); 
		computeAll();
    });

    cellMap.set(elm.id,new CellDetails(elm.id));
}

//download and export the table with its content in CSV format
function download_csv(csv, filename) {
    var csvFile;
    var downloadLink;
    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function export_table_to_csv(html, filename) {
	var csv = [];
	var rows = document.querySelectorAll("table tr");
	var k=0;
	var input = document.getElementsByTagName("input");
	var rows = document.querySelectorAll("table tr");
	for(var i = 0; i < rows.length; i++){
		var row = [];
		var cols = rows[i].querySelectorAll("td");
		for(var j = 0; j < cols.length-1; j++){
			if(k!=input.length){
				console.log("inside input: "+input[k].value);
			row.push(input[k].value);
			k++;
			console.log("value of k: "+k);
			}
		}
		csv.push(row.join(","));
	}
    // Download CSV
    download_csv(csv.join("\n"), filename);
}

document.querySelector("button").addEventListener("click", function () {
    var html = document.querySelector("table").outerHTML;
	export_table_to_csv(html, "table.csv");
});

