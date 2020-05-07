import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { WebSocketService } from "../web-socket.service";
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem } from '@angular/cdk/drag-drop';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.scss'],
  providers: [NgbModalConfig, NgbModal, MatSnackBar]
})

export class ComponentsComponent implements OnInit {
  page = 4;
  page1 = 5;
  focus;
  focus1;
  focus2;
  selectedpin = '';
  selecteddelay = '';
  selectedrotation = '';
  selecteddegree = '';
  selectedcomport = '';
  selectedbaudrate = '';
  arduinoPortData;
  arduinoRes = "false";
  arduinoBlink;
  connectionStatus='false';
  arduinoDegree = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180'];
  arduinoBaudRate = ['9600', '57600', '115200'];
  arduinoDigitalPin = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
  arduinoDelay = ['0', '500', '1000', '1500', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000'];
  arduinoRotation = ['Left', 'Right', 'Up', 'Down', 'Forward', 'Back', 'Open', 'Close'];
  date: { year: number, month: number };
  model: NgbDateStruct;
  constructor(private _snackBar: MatSnackBar,config: NgbModalConfig, private modalService: NgbModal, private WebSocketService: WebSocketService, private renderer: Renderer2) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  isDisabled(date: NgbDateStruct, current: { month: number }) {
    return date.month !== current.month;
  }
  todo = [];
  done = [];

  done1 = [
    'Left',
    'Right',
    'Up',
    'Down',
    'Forward',
    'Back',
    'Open',
    'Close',
  ];
  importCommandDialog;
  importLoopDialog;
  importTextDialog;
  importText;

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
  ngOnInit() {
    this.WebSocketService.listen('arduino_service').subscribe((data) => {
      this.arduinoPortData = data;
      console.log("port list:" + data);
      if (this.arduinoRes == 'false') {
        this.arduinoBlink = "Not Ready";
      }
      if (this.arduinoRes == 'Ok') {
        this.arduinoBlink = "Ready";
      }

    });
    this.WebSocketService.listen('arduino_service_result').subscribe((data1) => {

      this.arduinoRes = data1.toString();
      console.log(data1.toString());
      if (this.arduinoRes == 'false') {
        this.arduinoBlink = "Not Ready";
        this.openSnackBar("Arduino is not Ready","Error");
      }
      if (this.arduinoRes == 'Ok') {
        this.arduinoBlink = "Ready";
        this.openSnackBar("Arduino Ready","Success");
        this.connectionStatus='true';
      }

    });
    this.WebSocketService.listen('arduino_service_port_status_board').subscribe((data2) => {
      if(data2=='NotFound'){
        this.openSnackBar("Arduino is Ready","Error");
      }
    });
    this.WebSocketService.listen('arduino_service_loop_step').subscribe((step) => {
        this.openSnackBar("Loop "+step,"Success");
    });
    this.WebSocketService.listen('arduino_service_center_status').subscribe((step) => {
      this.openSnackBar("Centering is successful.","Success");
  });
    
    let input_group_focus = document.getElementsByClassName('form-control');
    let input_group = document.getElementsByClassName('input-group');
    for (let i = 0; i < input_group.length; i++) {
      input_group[i].children[0].addEventListener('focus', function () {
        input_group[i].classList.add('input-group-focus');
      });
      input_group[i].children[0].addEventListener('blur', function () {
        input_group[i].classList.remove('input-group-focus');
      });
    }
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  saveUpload(data) {
    console.log(data);

    if(this.importText != undefined){
      if (data == 'command') {
        this.done = [];
        var doneText = this.importText.split(",");
        for (let index = 0; index < doneText.length; index++) {
          const element = doneText[index];
          this.done.push(element)
        }
        this.importCommandDialog.close();
        this.openSnackBar("Commands loaded.","Success");
      }
      else if (data == 'loop') {
        this.todo = [];
        var todoText = this.importText.split(",");
        for (let index = 0; index < todoText.length; index++) {
          const element = todoText[index];
          this.todo.push(element)
        }
        this.importLoopDialog.close();
        this.openSnackBar("Loops loaded.","Success");
      }
      this.importText = null;
      
    }
    else{
      this.openSnackBar("You left this field empty","Error");
    }

  }
  clickMessage = '';
  arduinoStop() {

    this.WebSocketService.emit('arduino_stop', 'stop');
  }
  openCommand(content) {
    this.importCommandDialog = this.modalService.open(content);
  }
  openLoop(content) {
    this.importLoopDialog = this.modalService.open(content);
  }

  onClickMe(option) {
    //this.clickMessage = option;
    //console.log(option);
    // this.WebSocketService.emit('arduino_service_port',option);
  }
  arduinoList(data1, data2, data3, data4) {
    if (data1 == '' || data2 == '' || data3 == '' || data4 == '') {
      console.log('error');
    }
    else {
      console.log(data1 + "," + data2 + "," + data3 + "," + data4);
      this.done.push(data1 + '-' + data2 + '-' + data3 + "-" + data4);
    }

  }
  arduinoLoop(dataloop) {
    console.log(this.todo);
    if (this.todo.length == 1) {
    //  var json1 = this.todo.toString().split("-");
   //   var newjson1 = "{\"name\":\"" + json1[0] + "\",\"degree\":\"" + json1[3] + "\",\"delay\":\"" + json1[1] + "\",\"pin\":\"" + json1[2] + "\"}"
      this.WebSocketService.emit('arduino_loop', this.todo+","+dataloop);
    }
    else if (this.todo.length > 1) {
      this.WebSocketService.emit('arduino_loop', this.todo+","+dataloop);
    }
  }
  arduinoCenter() {
    console.log(this.todo);
    if (this.todo.length == 1) {
      var json1 = this.todo.toString().split("-");
      var newjson1 = "{\"name\":\"" + json1[0] + "\",\"degree\":\"" + json1[3] + "\",\"delay\":\"" + json1[1] + "\",\"pin\":\"" + json1[2] + "\"}"
      this.WebSocketService.emit('arduino_center', this.todo);
    }
    else if (this.todo.length > 1) {
      this.WebSocketService.emit('arduino_center', this.todo);
    }
  }
  arduinoConnection(data1, data2, data3) {
    if (data1 == '' || data2 == '') {
      console.log('error');
    }
    else {

      console.log(data1 + "," + data2);
      var data = "{\n  \"arduino_serial\": {\n    \"comport\": \"" + data1 + "\",\n    \"baudrate\": \"" + data2 + "\",\n    \"status\":\"" + this.connectionStatus + "\"\n  }\n}"
      //this.clickMessage = data1;
      this.WebSocketService.emit('arduino_service_port', data);


    }
  }
  arduinoConnectionClose() {
    this.WebSocketService.emit('arduino_service_port_close', 'false');
  }



  DownloadRobotLoopList() {
    this.WebSocketService.emit('arduino_service_download_loop_list', this.todo);
  }
  DownloadRobotCommandList() {
    this.WebSocketService.emit('arduino_service_download_command_list', this.done);
  }

}
