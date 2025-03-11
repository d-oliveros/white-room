export interface Label {
  createdAt: Date;
  label: string;
  labelDisplay: string;
  group: string;
  description: string;
}

export const sampleLabels: Label[] = [
  {
    createdAt: new Date('2024-03-20'),
    label: 'liquefaction_zone',
    labelDisplay: 'Liquefaction Zone',
    group: 'hazard',
    description:
      'Areas where historic occurrence of liquefaction, or local geological permanent ground ' +
      'displacements such that mitigation as defined in Public Resources Code Section 2693(c) would be required.',
  },
  {
    createdAt: new Date('2024-03-20'),
    label: 'landslide_zone',
    labelDisplay: 'Earthquake-Induced Landslides',
    group: 'hazard',
    description:
      'Areas where previous occurrence of landslide movement, or local topographic, geological, ' +
      'geotechnical and subsurface water conditions indicate a potential for permanent ground ' +
      'displacements such that mitigation as defined in Public Resources Code Section 2693(c) would be required.',
  },
  {
    createdAt: new Date('2024-03-20'),
    label: 'fault_zone',
    labelDisplay: 'Fault Zone',
    group: 'hazard',
    description:
      'Areas where active or potentially active faults have been mapped, indicating a potential for ' +
      'surface rupture. Development in these zones typically requires site-specific investigations or ' +
      'mitigation in accordance with the Alquist-Priolo Earthquake Fault Zoning Act (Public Resources ' +
      'Code Section 2621 et seq.).',
  },
];
