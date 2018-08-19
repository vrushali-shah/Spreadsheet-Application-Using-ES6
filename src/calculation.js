//import './postfix_expression.js';
export const regex = /=(SUM|SUB|DIV|MUL)\(([A-z][0-9]+):([A-z][0-9]+)\)$/i;
export const alph_regx=new RegExp('([a-zA-z])','g');
export const numb_regx=new RegExp('([0-9]+)','g');
export const arithmetic_regx= /=[a-z][0-9]((\+|\*|\/|\-)[a-z][0-9])+$/i;
export{computeAll,operate,operators,getter};

//keeps a check whether a cell in table is visited with its updated value
var computeAll = function() {
    var inputs=Array.from(document.getElementsByTagName("input"));
    for (let [ key, val ] of cellMap.entries()){
        val.visited=false;
    }
    inputs.forEach(function(elm) {
        try { 
            if(cellMap.get(elm.id).visited)
                elm.value=cellMap.get(elm.id).calc_value;
            else
                elm.value = getter(elm.id); 
        } catch(e) {
                
            } 
    });
};

//perform arithmetic operation based on operand
var operators = {
    '+' : function(a, b) { return a + b; },
    '-' : function(a, b) { return a - b; },
    '*' : function(a, b) { return a * b; },
    '/' : function(a, b) { return a / b; },
};

//evaluates the value based of different patterns for regex
var getter = function(elmid) {
    let value = cellMap.get(elmid).value|| "";
	let chk_regx=0;
	//pattern 1 for example =SUM(A1:C3)
	if(regex.test(value)){chk_regx=1;}
	//pattern 2 algebraic expression for example =ai+b2*c3/d4
	else if(arithmetic_regx.test(value)){chk_regx=2;}
		
    let result;
	//pattern 1
    if (chk_regx==1) {    
        value=value.toUpperCase();
		let range=/([A-z][0-9]+):([A-z][0-9]+)/.exec(value);//obtain the cell ID to later find its value
		let operation=value.match(/(SUM|SUB|DIV|MUL)/)[0];//obtain the kind of operation to be performed
		let alph=value.substr(5).match(alph_regx);//obtain the column name
		let numb=value.match(numb_regx).map(Number);//obtain the row number
		alph.sort();
		numb.sort();
			
        switch(operation){
            case 'SUM':
				result=operate(alph,numb,operators['+']);
				break;
            case 'SUB':
				result= operate(alph,numb,operators['-']);
				break;
            case 'DIV':
				result=operate(alph,numb,operators['/']);
				break;
            case 'MUL':
				result=operate(alph,numb,operators['*']);
				break;
            default:
				result="something wrong in getter switch";
            break;
        }
        //update the cell details to visited and its current value
        cellMap.get(elmid).calc_value=result;
        cellMap.get(elmid).visited=true;
        return result;
	} 
	//pattern 2
	else if(chk_regx==2){
		value=value.toUpperCase();
		let range=/[A-z][0-9]((\+|\*|\\|\-)[A-z][0-9])*/.exec(value);//find cell id to perform the opertaions
		let alph=value.substr(1).match(alph_regx);//obtain the column name
		let numb=value.match(numb_regx).map(Number);//obtain the row number
		
		 //obtain the value based on cell ID
         for(let k=0;k<alph.length;k++){
			var a;
			if(!cellMap.get(alph[k]+numb[k]).visited)
			a=getter(alph[k]+numb[k]);
			else
			a=cellMap.get(alph[k]+numb[k]).calc_value;
			value=value.replace(alph[k]+numb[k],a);//replace the cell ID with its actual content to form algebraic expression
		}
		
		//construct a postfix expression i.e convert infix to postfix expression
		var rpn = parse(value);
		var postfix = toString(rpn).split(" ");
		
		var postfixStack = [];
		for(let m=0;m<postfix.length;m++){
		let c=postfix[m];
		if(!isNaN(parseFloat(c))){
			postfixStack.push(parseFloat(c));
		}else {
			var op2=parseFloat(postfixStack.pop());
			var op1=parseFloat(postfixStack.pop());
			
			switch(postfix[m]){
				case '+':
                    console.log("in sum:"+op1+op2);
					postfixStack.push(op1+op2);
                    break;
				case '-':
                    console.log("in sub:"+op1-op2);
					postfixStack.push(op1-op2);
                    break;
				case '*':
                    console.log("in mul:"+op1*op2);
					postfixStack.push(op1*op2);
                    break;
				case '/':
                    console.log("in div:"+op1/op2);
					postfixStack.push(op1/op2);
                    break;
			}
		}
	}//end of for

		let result=postfixStack.pop();
		console.log("result: "+result);
		cellMap.get(elmid).calc_value=result;
		cellMap.get(elmid).visited=true;
		return result;
	}//end of 2nd if 
	//display contents of cell as is
	else { 
           let result= /^\d+\.\d+$/.test(value)? parseFloat(value):value;
           cellMap.get(elmid).calc_value=result;
           cellMap.get(elmid).visited=true;
           return result;
        }
};

var operate=function(alph,numb,op){
    try{
    var a;
    if(!cellMap.get(alph[0]+numb[0]).visited)
        a=getter(alph[0]+numb[0]);
    else
        a=cellMap.get(alph[0]+numb[0]).calc_value;
  
    for(let m=alph[0];m.charCodeAt(0)<=alph[1].charCodeAt(0); m=String.fromCharCode(m.charCodeAt(0)+1)){
      let n=numb[0];
      do{
          let value;
          if(!cellMap.get(m+n).visited)
                value=getter(m+n);
          else
                value=cellMap.get(m+n).calc_value;
          if(value===null)
                 return "Invalid";
            
          if(/^\d+\.\d+$/.test(value) || /^-{0,1}\d+$/.test(value) || value===""){
               n++;
               console.log(a);
			   if(value==="" || alph[0]+numb[0]==m+(n-1))
               continue;
			   a=op(parseFloat(a),parseFloat(value));
            }
           else{
                return "Invalid";
            }
        }while(n<=numb[1]);
    }
    return a;
	}//end of try
    catch(e){
        console.log("Invalid Range");
        return "Invalid Range";
    }
}

//constructing and evaluating postfix expression
//parse the infix expression and convert it to postfix
function parse(inp){
	var outQueue=[];
	var opStack=[];

	//peek the top most element
	Array.prototype.peek = function() {
		return this.slice(-1)[0];
	};

	//associativity rule for evaluation
	var assoc = {
		"^" : "right",
		"*" : "left",
		"/" : "left",
		"+" : "left",
		"-" : "left"
	};

	//precendence rule for evaluation
	var prec = {
		"^" : 4,
		"*" : 3,
		"/" : 3,
		"+" : 2,
		"-" : 2
	};

	Token.prototype.precedence = function() {
		return prec[this.value];
	};
	
	Token.prototype.associativity = function() {
		return assoc[this.value];
	};

	//tokenize
	var tokens=tokenize(inp);

	tokens.forEach(function(v) {
		//If the token is a number, then push it to the output queue
		if(v.type === "Literal" || v.type === "Variable" ) {
			outQueue.push(v);
		} 
		//If the token is a function token, then push it onto the stack.
		else if(v.type === "Function") {
			opStack.push(v);
		} //If the token is a function argument separator 
		else if(v.type === "Function Argument Separator") {
			//Until the token at the top of the stack is a left parenthesis
			//pop operators off the stack onto the output queue.
			while(opStack.peek()
				&& opStack.peek().type !== "Left Parenthesis") {
				outQueue.push(opStack.pop());
			}
		} 
		//If the token is an operator, o1, then:
		else if(v.type == "Operator") {
			  //while there is an operator token o2, at the top of the operator stack and either
			  while (opStack.peek() && (opStack.peek().type === "Operator") 
				//o1 is left-associative and its precedence is less than or equal to that of o2, or
				&& ((v.associativity() === "left" && v.precedence() <= opStack.peek().precedence())
					//o1 is right associative, and has precedence less than that of o2,
					|| (v.associativity() === "right" && v.precedence() < opStack.peek().precedence()))) {
			  	outQueue.push(opStack.pop()+" ");
			}
			//at the end of iteration push o1 onto the operator stack
			opStack.push(v);
		} 
		
		//If the token is a left parenthesis (i.e. "("), then push it onto the stack.
		else if(v.type === "Left Parenthesis") {
			opStack.push(v+" ");
		}
		//If the token is a right parenthesis (i.e. ")"):
		else if(v.type === "Right Parenthesis") {
			//Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
			while(opStack.peek() 
				&& opStack.peek().type !== "Left Parenthesis") {
				outQueue.push(opStack.pop()+" ");
		}
			if(opStack.length == 0){
				console.log("Unmatched parentheses");
				return;
			}
			//Pop the left parenthesis from the stack, but not onto the output queue.
			opStack.pop();

			//If the token at the top of the stack is a function token, pop it onto the output queue.
			if(opStack.peek() && opStack.peek().type === "Function") {
				outQueue.push(opStack.pop()+" ");
			}
		}
	});
	return outQueue.concat(opStack.reverse());
}

function toString(rpn) {
	return rpn.map(token => token.value).join(" ");
}

//attributes of token object
function Token(type, value) {
	this.type = type;
	this.value = value;
}

function isComma(ch) {
	return /,/.test(ch);
}

function isDigit(ch) {
	return /\d/.test(ch);
}

function isLetter(ch) {
	return /[a-z]/i.test(ch);
}

function isOperator(ch) {
	return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis(ch) {
	return /\(/.test(ch);
}

function isRightParenthesis(ch) {
	return /\)/.test(ch);
}

function tokenize(str) {
	str.replace(/\s+/g, "");
	str=str.split("");

	var result=[];
	var letterBuffer=[];
	var numberBuffer=[];

	str.forEach(function (char, idx) {
		if(isDigit(char)) {
			numberBuffer.push(char);
		} else if(char==".") {
			numberBuffer.push(char);
		} else if (isLetter(char)) {
			if(numberBuffer.length) {
				emptyNumberBufferAsLiteral();
				result.push(new Token("Operator", "*"));
			}
			letterBuffer.push(char);
		} else if (isOperator(char)) {
			emptyNumberBufferAsLiteral();
			emptyLetterBufferAsVariables();
			result.push(new Token("Operator", char));
		} else if (isLeftParenthesis(char)) {
			if(letterBuffer.length) {
				result.push(new Token("Function", letterBuffer.join("")));
				letterBuffer=[];
			} else if(numberBuffer.length) {
				emptyNumberBufferAsLiteral();
				result.push(new Token("Operator", "*"));
			}
			result.push(new Token("Left Parenthesis", char));
		} else if (isRightParenthesis(char)) {
			emptyLetterBufferAsVariables();
			emptyNumberBufferAsLiteral();
			result.push(new Token("Right Parenthesis", char));
		} else if (isComma(char)) {
			emptyNumberBufferAsLiteral();
			emptyLetterBufferAsVariables();
			result.push(new Token("Function Argument Separator", char));
		}
	});
	if (numberBuffer.length) {
		emptyNumberBufferAsLiteral();
	}
	if(letterBuffer.length) {
		emptyLetterBufferAsVariables();
	}
	return result;

	function emptyLetterBufferAsVariables() {
		var l = letterBuffer.length;
		for (var i = 0; i < l; i++) {
			result.push(new Token("Variable", letterBuffer[i]));
          if(i< l-1) { //there are more Variables left
          	result.push(new Token("Operator", "*"));
          }
      }
      letterBuffer = [];
}

function emptyNumberBufferAsLiteral() {
  	if(numberBuffer.length) {
  		result.push(new Token("Literal", numberBuffer.join("")));
  		numberBuffer=[];
  	}
  }
}

function isOperator(toCheck) {
    switch (toCheck) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
            return true;
        default:
            return false;
    }
}
