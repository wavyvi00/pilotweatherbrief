
export interface ChecklistItem {
    id: string;
    label: string;
    checked?: boolean; // Runtime state
    type?: 'check' | 'note' | 'warning';
}

export interface ChecklistSection {
    id: string;
    title: string;
    items: ChecklistItem[];
    expanded?: boolean; // Runtime state
}

export interface Checklist {
    id: string;
    aircraftType: string; // e.g. "C172S"
    title: string; // e.g. "Normal Procedures"
    sections: ChecklistSection[];
}
