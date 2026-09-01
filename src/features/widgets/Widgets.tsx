import React from 'react';

export interface WidgetsProps {
  widgets?: any[];
}

const Widgets: React.FC<WidgetsProps> = ({ widgets = [] }) => {
  return (
    <div className="os-widgets">
      {widgets.map((widget, index) => (
        <div key={widget.id || index} className="os-widget">
          Widget {index + 1}
        </div>
      ))}
    </div>
  );
};

export default Widgets;
