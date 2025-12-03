import { DebugSection } from '../../types/debug';

const SendDebuggers: DebugSection[] = [
  {
    label: 'Example Section',
    actions: [
      {
        type: 'button',
        label: 'Test Button',
        action: () => {},
      },
      {
        type: 'text',
        label: 'Test Input',
        value: '',
        action: (value) => {},
      },
      {
        type: 'checkbox',
        label: 'Test Checkbox',
        value: false,
        action: (value) => {},
      },
      {
        type: 'slider',
        label: 'Test Slider',
        value: 50,
        min: 0,
        max: 100,
        step: 1,
        action: (value) => {},
      },
    ],
  },
];

export default SendDebuggers;
