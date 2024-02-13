import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

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




// const Media = () => Widget.Button({
//     class_name: 'media',
//     on_primary_click: () => Mpris.getPlayer('')?.playPause(),
//     on_scroll_up: () => Mpris.getPlayer('')?.next(),
//     on_scroll_down: () => Mpris.getPlayer('')?.previous(),
//     child: Widget.Label('-').hook(Mpris, self => {
//         if (Mpris.players[0]) {
//             const { track_artists, track_title } = Mpris.players[0];
//             self.label = `${track_artists.join(', ')} - ${track_title}`;
//         } else {
//             self.label = 'Nothing is playing';
//         }
//     }, 'player-changed'),
// });

const activateContextMenu = () => Widget.Button({
    class_name: 'cmButton',
    on_clicked: () => {contextMenu(0)},
})




// layout of the bar
const Left = () => Widget.Box({
    spacing: 8,
    children: [
        Workspaces(),
    ],
});

const Center = () => Widget.Box({
    spacing: 8,
    children: [
        activateContextMenu()
    ],
});

const childrenOfContextMenu = () => Widget.Box({
    spacing: 8,
    children: [
      
    ],
});

const Right = () => Widget.Box({
    hpack: 'end',
    spacing: 8,
    children: [
        Clock(),  
         
    ],
});

const contextMenu = ({ monitor = 0 }) => Widget.Window({
    class_name: 'menu',
    monitor,
    anchor: ['right','top'],
    exclusivity: 'exclusive',
    layer: 'top',
    child: Widget.Label('hello'),
    
})

const Bar = (monitor = 0) => Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: 'bar',
    monitor,
    anchor: ['top', 'left', 'right',],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
        start_widget: Left(),
        center_widget: Center(),
        end_widget: Right(),
    }),
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
        Bar(0)

        // you can call it, for each monitor
        // Bar(0),
        // Bar(1)
    ],
};
