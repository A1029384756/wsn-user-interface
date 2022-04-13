import './App.css';
import React, { useEffect } from 'react'; 
import Graph from './components/graph/graph.js';
import { Button, ButtonGroup, MenuItem, Select } from '@mui/material';
import { useState } from "react";

var notifyCharacteristic;
var tempFormula;

const App = () => {
  const [displayUnits, setDisplayUnits] = useState("farenheit");
  const handleDisplayUnits = (e) => setDisplayUnits(e.target.value);

  const [maxPoints, setMaxPoints] = useState({max: 5});
  const handleMaxPoints = (e) => setMaxPoints(prevMax => {
    var max;

    if (e.target.id === 'add') {
      max = prevMax.max + 1;
    } else if (e.target.id === 'subtract') {
      max = prevMax.max - 1;
    }

    return {...prevMax, max};
  });

  const [newData, setNewData] = useState({nextTemp: null});
  const handleNewData = (e) => setNewData(prevTemp => {
    var nextTemp;

    if (typeof(e) === 'number') {
      if (tempFormula === "farenheit") {
        nextTemp = e * 1.8 + 32;
      } else {
        nextTemp = e;
      }
    } else {
      nextTemp = Math.random() * 100;
    }

    return {...prevTemp, nextTemp};
  });

  useEffect(() => {
    tempFormula = displayUnits;
  }, [displayUnits]);

  const handleNotifications = (event) => {
    let value = event.target.value;
    let data = value.getUint16()/100.0;
    handleNewData(data);
  }

  const connectBluetooth = () => {
    let serviceUuid = '0x0000ffe0-0000-1000-8000-00805f9b34fb';
    if (serviceUuid.startsWith('0x')) { serviceUuid = parseInt(serviceUuid); }
  
    let characteristicUuid = '0x0000ffe1-0000-1000-8000-00805f9b34fb';
    if (characteristicUuid.startsWith('0x')) { characteristicUuid = parseInt(characteristicUuid); }
  
    navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
    .then(device => {
        return device.gatt.connect();
    })
    .then(server => {
        return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
        return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
        notifyCharacteristic = characteristic;
        return notifyCharacteristic.startNotifications().then(_ => {
            notifyCharacteristic.addEventListener('characteristicvaluechanged',
            handleNotifications);
        });
    })
    .catch(error => { console.log(error); });
  }

  return (
    <div>
      <Graph displayUnits={displayUnits} newData={newData} maxPoints={maxPoints}/>
      <div className='controls'>
        <div className='dataManip'>
            <Select value={displayUnits} onChange={handleDisplayUnits}>
              <MenuItem value="farenheit">Farenheit</MenuItem>
              <MenuItem value="celsius">Celsius</MenuItem>
            </Select>
            <Button variant='contained' onClick={handleNewData}>Add data</Button>
        </div>
        <div className='dataAdd'>
          <ButtonGroup variant='contained'>
            <Button id='subtract' onClick={handleMaxPoints}>-</Button>
            <div className='buttonLabel'>{maxPoints.max}</div>
            <Button id='add' onClick={handleMaxPoints}>+</Button>
          </ButtonGroup>
          <Button variant='contained' onClick={connectBluetooth}>Connect Bluetooth</Button>
        </div>
      </div>
    </div>
  );
}
export default App;
