
import type { Checklist } from '../types/checklist';

export const C172S_CHECKLIST: Checklist = {
    id: 'c172s-normal',
    aircraftType: 'C172S',
    title: 'C172S Normal Procedures',
    sections: [
        {
            id: 'preflight',
            title: 'Preflight Inspection',
            items: [
                { id: 'pf1', label: 'Cabin - ARROW documents check' },
                { id: 'pf2', label: 'Control Lock - Remove' },
                { id: 'pf3', label: 'Ignition Switch - OFF' },
                { id: 'pf4', label: 'Master Switch - ON' },
                { id: 'pf5', label: 'Fuel Quantity Indicators - CHECK' },
                { id: 'pf6', label: 'Master Switch - OFF' }
            ]
        },
        {
            id: 'start',
            title: 'Engine Start',
            items: [
                { id: 'st1', label: 'Throttle - OPEN 1/4 INCH' },
                { id: 'st2', label: 'Mixture - IDLE CUTOFF' },
                { id: 'st3', label: 'Propeller Area - CLEAR' },
                { id: 'st4', label: 'Master Switch - ON' },
                { id: 'st5', label: 'Flashing Beacon - ON' },
                { id: 'st6', label: 'Ignition - START (Release when engine starts)' },
                { id: 'st7', label: 'Mixture - ADVANCE smoothly' }
            ]
        },
        {
            id: 'runup',
            title: 'Before Takeoff',
            items: [
                { id: 'bt1', label: 'Parking Brake - SET' },
                { id: 'bt2', label: 'Seats, Belts, Harnesses - ADJUST & LOCK' },
                { id: 'bt3', label: 'Cabin Doors - CLOSED & LOCKED' },
                { id: 'bt4', label: 'Flight Controls - FREE & CORRECT' },
                { id: 'bt5', label: 'Flight Instruments - SET' },
                { id: 'bt6', label: 'Fuel Selector - BOTH' },
                { id: 'bt7', label: 'Elevator Trim - TAKEOFF' },
                { id: 'bt8', label: 'Throttle - 1800 RPM' },
                { id: 'bt9', label: 'Magnetos - CHECK (Max drop 150, Diff 50)' },
                { id: 'bt10', label: 'Vacuum Gage - CHECK' },
                { id: 'bt11', label: 'Engine Instruments - CHECK' },
                { id: 'bt12', label: 'Annunciator Panel - CLEAR' },
                { id: 'bt13', label: 'Throttle - CHECK IDLE' },
                { id: 'bt14', label: 'Throttle - 1000 RPM' },
                { id: 'bt15', label: 'Radios - SET' },
                { id: 'bt16', label: 'Transponder - SET' }
            ]
        }
    ]
};

export const ALL_CHECKLISTS: Checklist[] = [
    C172S_CHECKLIST
];
