import React from 'react';

export interface AppSize {
  width: number;
  height: number;
}

export type AppWindowType = 'iframe' | 'embed' | 'internal-component';

export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  component?: React.ComponentType<any>;
  category?: 'system' | 'internet' | 'media' | 'tools' | 'utilities';
  defaultSize?: AppSize;
  minSize?: AppSize;
  singleInstance?: boolean;
  isSystemApp?: boolean;
  type?: AppWindowType;
  src?: string;
  version?: string;
}

export interface AppRegistryEntry extends AppManifest {
  isRegistered: boolean;
}
