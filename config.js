import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';


const Workspaces = () => Widget.Box({
    class_name: 'workspaces',
    children: Hyprland.bind('workspaces').transform(ws => {
        return ws.map(({ id }) => Widget.Button({
            on_clicked: () => Hyprland.sendMessage(`dispatch workspace ${id}`),
            child: Widget.Label(`${id}`),
            class_name: Hyprland.active.workspace.bind('id')
                .transform(i => `${i === id ? 'focused' : ''}`),
        }));
    }),
});

const Clock = () => Widget.Label({
    class_name: 'clock',
    setup: self => self
        // this is bad practice, since exec() will block the main event loop
        // in the case of a simple date its not really a problem
        .poll(1000, self => self.label = exec('date "+%H:%M:%S %b %e."'))

        // this is what you should do
        .poll(1000, self => execAsync(['date', '+%H:%M:%S %b %e.'])
           .then(date => self.label = date)),
});

const Volume = () => Widget.Box({
    class_name: 'volume',
    css: 'min-width: 65px',
    children: [
        Widget.Icon().hook(Audio, self => {

            if (!Audio.speaker)
                return;

            const category = {
                101: 'overamplified',
                67: 'high',
                34: 'medium',
                1: 'low',
                0: 'muted',
            };
            const icon = Audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
                threshold => threshold <= Audio.speaker.volume * 100);
            
            self.icon = `audio-volume-${category[icon]}-symbolic`;
        }, 'speaker-changed'),
         Widget.Button({            
              on_clicked: () => Audio.speaker.volume = !Audio.speaker.volume,
              on_scroll_up: () => Audio.speaker.volume = Audio.speaker.volume + 0.1,
              on_scroll_down: () => Audio.speaker.volume = Audio.speaker.volume -0.1,
              child: Widget.Label('-').hook(Audio,self =>{
                  self.label = `${Math.round(Audio.speaker.volume * 100)}%`;
              }),
          }),
    ],
});

const network = await Service.import('network')

const Network1 = () => Widget.Box({
    class_name: 'Network',
    css: 'min-width: 65px',
    children: [
    connection(),
    ],
});

const connection = () => Widget.Box({
    class_name: 'connection',
    children: [
    Widget.Icon().hook(network, self =>{
                 if(network.primary == 'wifi'){
                    const icon = network.wifi.strenght;
                    const category = {
                      100: 'excellent',
                      67: 'good',
                      34: 'ok',
                      1: 'weak',
                      0: 'none',
                    }
                    self.icon = `network-wireless-signal-${category[icon]}`;
                }else if(network.primary == 'wired'){
                  self.icon = `network-wired`;
                }else{
                  self.icon = `network-offline`;
                }
              }),
      Widget.Button({
      on_clicked: () => wifiMenu(1),
          child:
              Widget.Label('-').hook(network,self =>{
                  if(network.primary == 'wired'){
                    self.label = `${network.wired.internet}`;
                  }else if(network.primary == 'wifi'){
                    self.label = `${network.wifi.internet}`;
                  }else{
                    self.label = `no-network`;
                  }
            }), 
      }), 
  ], 
});

const power = () => Widget.Box({
    class_name: 'power',
    css: 'min-width: 65px',
    children: [
    ],
});

const bright = () => Widget.Box({
    class_name: 'bright',
    css: 'min-width: 65px',
    children: [
    ],
});


const blue = () => Widget.Box({
    class_name: 'blue',
    css: 'min-width: 65px',
    children: [
    ],
});

const batt = () => Widget.Box({
    class_name: 'batt',
    css: 'min-width: 65px',
    children: [
    ],
});


const wifiBox = () => Widget.Box({
    class_name: 'wifiBox',
    children: [
       Widget.Label("test2"),
       Widget.Label("test2")

    ],
});



const Left = () => Widget.Box({
    spacing: 8,
    children: [
        Workspaces(),
    ],
});

const Center = () => Widget.Box({
    spacing: 8,
    children: [
        Clock(), 
    ],
});

const Right = () => Widget.Box({
    hpack: 'end',
    spacing: 8,
    children: [
        //power(),
        //batt(),
        Volume(),
        //blue(),
        Network1(),
        //bright(),
    ],
});

const Bar = (monitor = 0) => Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: 'bar',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
        start_widget: Left(),
        center_widget: Center(),
        end_widget: Right(),
    }),
});


const wifiMenu = (monitor = 0) => Widget.Window({
    name: `wifiMenu`, // name has to be unique 
    css: 'min-width: 200px',
    class_name: 'wifiMenu',
    monitor,
    anchor: ['top','right'],
    exclusivity: 'exclusive',
    child: wifiBox(),
});


import { monitorFile } from 'resource:///com/github/Aylur/ags/utils.js';

monitorFile(
    `${App.configDir}/style.css`,
    function() {
        App.resetCss();
        App.applyCss(`${App.configDir}/style.css`);
    },
);

// exporting the config so ags can manage the windows
export default {
    style: App.configDir + '/style.css',
    windows: [
    //Bar(),
        Bar(0),
	Bar(1)
    ],
};
