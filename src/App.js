import React, { use, useState, useRef, useEffect } from 'react'; //Mostrar el resultado en la pantalla de la calcukadora
import ButtonPressed from './assets/sounds/ButtonPressed.MP3';
import './App.css'; //Estilo de la calculadora
import './assets/fonts/sf-pro-display-light.otf'; //Importar la tipografia de apple
const math = require('mathjs'); //Importar la libreria mathjs para realizar operaciones matematicas

let resultPressed = false; //Activar operador booleando de que el operador "=" ha sido presionado

function App() {
  const [display, setDisplay] = useState('0'); //Estado del display
  const [operation, setOperation] = useState('0'); //Estado de la operacion
  const [operator, setOperator] = useState(null); //Estado del operador
  const [num1, setNum1] = useState(null); //Estado del primer numero
  const [num2, setNum2] = useState(null); //Estado del segundo numero

  const clickSound = useRef(new Audio(ButtonPressed)); // Audio de boton presionado

  // display = Mostrar los numeros ingresados por el usuario en pantalla
  // operation = Mostrar las operaciones realizadas por el usuario en pantalla
  // operator = Guardar el operador ingresado por el usuario
  // num1 = Guardar el primer numeros ingresado por el usuario, y asignar el resultado previo de una operacion
  // num = Asingar el segundo numero de la operacion ingresado por el usuario



  // FUNCIONES PARA EL MANEJO DE LOS CLICKS EN CALCULADORA
    // - Manejo de los clicks (numeros y decimales)
    // - Manejo de los operadores
    // - Manejo de "=" para asignar resultados
    // - Manejo de botones auxiliares para el funcionamiento de la calculadora | C, CE, ←



  const handleClick = (click) => {

    clickSound.current.play(); // Hacer 'pup' :)

    if (display === 'Error' || display === 'NaN') { //Validar si el display contiene un error o un 0
      setDisplay(click);
      setOperation(click);
      return;
    }

    if (num1 !== null && operator === null) { //Validar si unicamente existe el resultado en el display
      setOperation('0'); //Reestablecer la expresion
      setNum1(null); //Reestablecer el valor de num1 para asignar uno nuevo por el usuario
    } else if (num1 !== null && operator !== null) {
      setNum2(display);
    }

    if (display.length <= 8) { // Validar que el display no exceda el límite de 8 caracteres
      if (click === '.') { // Validar si el usuario ha ingresado un punto
        if (!display.includes('.')) { // Validar que el numero ingresado no tenga un punto previamente
          setDisplay((prev) => prev + click); //El usuario puede seguir agregando numeros
          setOperation((prev) => prev + click); //Actualizar la expresion
        }
      } else { //Entonces el usuario no ha ingresado un decimal
        setDisplay((prev) => (prev === '0' ? click : prev + click)); // Concatenar números limpio
        setOperation((prev) => (prev === '0' ? click : prev + click)); // Concatenar en operación
      }
    }

    resultPressed = false //El usuario puede eliminar numeros despues de que la calculadora mostro el resultado
    
  }; //Fin de la funcion handleClick
  

  //Funcion para el manejo de los operadores en la calculadora
  const handleOperator = (click) => {

    clickSound.current.play(); // Hacer 'pup' :)

    const visualOperator = mapOperator(click); //Asignar el simbolo del operador a la expresion
    const operadores = ['+', '-', '*', '/']; //Arreglo de operadores

    if (display === 'Error' || display === 'NaN') { //Validar si el display contiene un error o un 0
      setDisplay('0');
      setOperation('0');
      return;
    }

    if (num1 === null) { //Validar si no se ha asignado el primer numero
      setNum1(parseFloat(display)); //Asignar el primer numero
      setOperator(click); //Asignar el operador
      setOperation(`${parseFloat(display)} ${visualOperator} `); //Mostrar la operacion en pantalla
      setDisplay('0'); // Reiniciar el display
    } else if (num1 !== null && operator === null) { //Entonces num1 ya tiene valor pero no hay operador
      setOperator(click); //Asinar el operador
      setOperation(`${parseFloat(num1)} ${visualOperator} `); //Actualizar la operacion
    } else if (operadores.includes(click)) { //Validar si el siguiente click es un operador
      setOperator(click); //Asinar el operador
      setOperation(`${parseFloat(num1)} ${visualOperator} `); //Actualizar la operacion
    } else if (num1 !== null && operator !== null && num2 === null){ //Validar si el primer numero tiene un valor, con el fin de asignar un valor a num2
      setNum2(parseFloat(display)); //Asignar el segundo numero de la operacion
      setOperation(`${parseFloat(num1)} ${visualOperator} ${parseFloat(display)}`); //Mostrar la operacion en pantalla
      setDisplay('0'); // Reiniciar el display
    } 
    
    if (num1 !== null && display !== null && display !== '0' && operator !== null) { //Validar si existe un operador
      const resultado = operations(parseFloat(num1), operator, parseFloat(display)); // Usa el operador previo para la operacion
      const result = resultado.toString().length > 8 ? parseFloat(resultado.toPrecision(9)) : resultado; // Redondear a 8 dígitos significativos
      setNum1(result); // Actualiza num1 con el resultado
      setOperator(click); // Actualiza al nuevo operador presionado por el usuario
      setNum2(null); // Reinicia num2
      setOperation(` ${result} ${visualOperator} `); // Actualiza la expresion y la hace visible al usuario
      setDisplay('0'); // Reinicia el display
    }

  }; //Fin de la funcion handleOperator

  const handleEqual = () => {

    clickSound.current.play(); // Hacer 'pup' :)

    if (display === 'Error' || display === 'NaN') { //Validar si el display contiene un error o un 0
      setDisplay('0');
      setOperation('0');
      return;
    }

    if (num1 === null) { //Validar si no se ha asignado el primer numero
      setNum1(parseFloat(operation)); //Asignar el primer numero
      setOperation(`${parseFloat(operation)} `); //Mostrar el numero ingresado por el usuario
      setDisplay('0'); // Reiniciar el display
      resultPressed = true; //"=" ha sido presionado
    } else if (num1 !== null && operator === null) { //Validar si existe un numero ingresado por el usuario pero no un operador
      setOperation(`${parseFloat(num1)} `); //Mostrar el numero ingresado por el usuario
      setDisplay('0'); //Mostrar el numero ingresado por el usuario
      resultPressed = true; //"=" ha sido presionado
    } else if (operator !== null) { //Validar si existe un operador en la expresion
      const result = operations(parseFloat(num1), operator, parseFloat(display)); //Realizar la operacion
        if (result !== 'Error') { //Validar si el resultado no es un error
          setNum1(parseFloat(result.toPrecision(9))); //Asignar el primer numero de la expresion como el resultado de la operacion anterior
          setOperation(`${parseFloat(result.toPrecision(9))} `); //Asignar la expresion del usuario
          setDisplay('0'); //Reiniciar el display
          setOperator(null); //Reestablecer el operador
          resultPressed = true; //Activar operador booleando de que el operador "=" ha sido presionado
        }
    }
     
  }; //Fin de la funcion handleEqual

  // Funcion para realizar las operaciones matematicas que el usuario realice
  const operations = (num1, operator, num2) => {

    try { //Intentar realizar la operacion
      const result = math.evaluate(`${num1} ${operator} ${num2}`); //Realizar la operacion
  
      if (isNaN(result) || !isFinite(result) || math.isUndefined(result)) { // Validar si el resultado es NaN o Infinity
        setDisplay('Error'); // Mostrar "Error" en el display
        setOperation('Error'); // Mostrar "Error" en las operaciones
        setNum1(null); // Reiniciar num1
        setNum2(null); // Reiniciar num2
        setOperator(null); // Reiniciar el operador
        return 'Error'; // Retornar "Error" como resultado
      }
      return result; // Si el resultado es válido, actualizar el estado
  
    } catch (error) {
      // Capturar cualquier otro error inesperado
      setDisplay('Error'); // Mostrar "Error" en el display
      setOperation('Error'); // Mostrar "Error" en las operaciones
      setNum1(null); // Reiniciar num1
      setNum2(null); // Reiniciar num2
      setOperator(null); // Reiniciar el operador
      return 'Error'; // Retornar "Error" como resultado
    }
  }; //Fin de la funcion operations

  // Funcion para eliminar el contenido del display, mas no las operaciones (o en su caso la expresion) previamente realizadas
  const CE = () => {

    clickSound.current.play(); // Hacer 'pup' :)
    const visualOperator = mapOperator(operator); //Asignar el simbolo del operador a la expresion

    setDisplay('0')
    
    if (operator !== null) {
      setOperation(` ${parseFloat(num1)} ${visualOperator} `);
    } else if (num1 === null) {
      setOperation('0');
    } else {
      setOperation(parseFloat(num1)); //Elimina el contenido de la expresion y se limita a num1, o en su caso al resutlado de la operacion
    }

  }; //Fin de la funcion CE (eliminar el contenido del display y preservar la expresion)

  // Funcion para eliminar el contenido del display y toda la expresion
  const C = () => {

    clickSound.current.play(); // Hacer 'pup' :)

    setDisplay('0'); //Colocar el display en 0
    setNum2(null); //Reestablecer el segundo numero
    setNum1(null); //Restablecer el primer numero 
    setOperator(null); //Reestablecer el operador
    setOperation('0'); //Eliminar las operaciones 

  }; //Fin de la funcion C (Eliminar todo el contenido de la calculadora)

  //Funcion para eliminar un numero del display
  const deleteNum = () => { //Eliminar el ultimo numero ingresado

    clickSound.current.play(); // Hacer 'pup' :)
    
    const operadores = ['+', '-', '*', '/']; //Arreglo de operadores

    if (display === 'Error' || display === 'NaN') { //Validar si el display contiene un error o un 0
      setDisplay('0');
      setOperation('0');
      return;
    }

    if (resultPressed) { //Validar si el operador "=" fue presionado
      return; //No hacer nada
    } else {
      const lastChar = operation.trim().slice(-1); // Obtener el último carácter de la operación (sin espacios finales)

      if (!operadores.includes(lastChar)) { // Si el último carácter NO es un operador, se permite la eliminación de digitos
        if (display.length >= 2) { //Validar si la longitud del display es mayor o igual a 2
          setDisplay(display.slice(0, display.length - 1)); // Eliminar el último dígito del display
          setOperation(operation.slice(0, operation.length - 1)); // Eliminar el último carácter de la operación
        } else { //La longitud del display es menor que 2, por lo tanto ya se puede asignar 0 en caso de que el usuario elimine un digito mas
          setDisplay('0'); // Colocar el display en 0
          setOperation(operation.slice(0, operation.length - 1)); // Eliminar el último carácter de la operación
        }
      } else { //Entonces el ultimo caracter es un operador
        return; //No hacer nada
      }

    }

  }; //Fin de deleteNum



  // MANEJO DEL INPUT DEL TECLADO PARA LA CALCULADORA



  const handleKeyPress = (event) => {
    const { key } = event; // Captura la tecla presionada
    if (!isNaN(parseInt(key))) { //Validar si la tecla es un numero
      handleClick(key); //Manejar los digitos presionados por el usuario
    } else if (['+', '-', '*', '/'].includes(key)) { //Validar si la tecla es un operador
      handleOperator(key); //Manejar las operaciones y los operadores
    } else if (key === 'Enter' || key === '=') { //Validar si el usuario presiono enter o igual 
      handleEqual(); //Hacer las operaciones en caso de que se puedan hacer
    } else if (key === 'Backspace') { //Validar si la tecla es backspace
      deleteNum(); //Eliminar el digito en el display
    } else if (key === 'c' || key === 'C') { //Validar si la tecla es "C"
      C(); //Eliminar todo el contenido
    } else if (key === '.') {
      if (!display.includes('.')) {
        handleClick('.');
      }
    }
  };

  // Agregar el listener al teclado
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleClick, handleOperator, handleEqual, deleteNum, C, CE]);



  // FUNCIONES AUXILIARES PARA PROPORCIONAR FORMATO A LA CALCULADORA
    // - Designar el tamaño de la letra del display mediante clases
    // - Asignar simbolos a la expresion (aspecto visual del display de operaciones)



  // Funcion para asignar simbolos a la expresion
  const mapOperator = (operator) => {
    switch (operator) {
      case '/': return '÷'; //Cambiar el signo de division
      case '*': return '×'; //Cambiar el signo de multiplicacion
      default: return operator; //Mantener el signo original
    }
  }; //Fin de la funcion mapOperator

  //Funcion para que el display en pantalla no exceda la longitu de la interfaz
  const getDisplayClass = () => {  
    if (display.length === 9) { //Validar si el display contiene 9 digitos (es el valor maximo del display)
      return 'extra-small-text'; //Asignar tamaño pequeño a la fuente del display
    } else if (display.length >= 7) { //Valiar si el display contiene 7 digitos
      return 'small-text'; //Asignar tamaño mediano a la fuente del display
    } else {
      return ''; //Conservar el tamaño original
    }
  }; //Fin de getDisplayClass

  return (
    <div className="App">
      <article className='Calculadora'>
        <section className='Calculadora_botones'>
          <div className={ 'Operation' } typeof='text' id='operaciones'> { operation } </div>
          <div className={ `pantalla ${getDisplayClass()}` } typeof='text' id='pantalla'> { display } </div>

          <button onClick = { deleteNum } id='btn_eliminarNumero'>←</button>
          <button onClick = { CE }id='btn_eliminarContenido'>CE</button>
          <button onClick = { C } id='btn_eliminarOperacion'>C</button>
          <button onClick= { () => handleOperator('/') } id='btn_dividir'></button>

          <button onClick = { () => handleClick('7') } id='btn_7'>7</button>
          <button onClick = { () => handleClick('8') } id='btn_8'>8</button>
          <button onClick = { () => handleClick('9') } id='btn_9'>9</button>
          <button onClick = { () => handleOperator('*') } id='btn_multiplicar'></button>

          <button onClick = { () => handleClick('4') } id='btn_4'>4</button>
          <button onClick = { () => handleClick('5') } id='btn_5'>5</button>
          <button onClick = { () => handleClick('6') } id='btn_6'>6</button>
          <button onClick = { () => handleOperator('-') } id='btn_restar'></button>

          <button onClick = { () => handleClick('1') } id='btn_1'>1</button>
          <button onClick = { () => handleClick('2') } id='btn_2'>2</button>
          <button onClick = { () => handleClick('3') } id='btn_3'>3</button>
          <button onClick = { () => handleOperator('+') } id='btn_sumar'></button>

          <button onClick = { () => handleClick('0') } id='btn_0'>0</button>
          <button onClick = { () => handleClick('.') } id='btn_decimal'>.</button>
          <button onClick = { () => handleEqual('=') }id='btn_igual'></button>
        </section>
      </article>

    </div>
  );
} //Fin de function App

export default App;