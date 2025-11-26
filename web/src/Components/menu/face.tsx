import { FC, useState, useEffect } from 'react';
import { Box, TextInput, Button, Stack, Text, Grid, NumberInput } from '@mantine/core';
import { Divider } from '../micro/Divider';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { TValue, THeadOverlay } from '../../types/appearance';


// export const FaceMenu: FC = () => {
//   const { locale, selectedTab } = useAppearanceStore();
//   const [headBlend, setHeadBlend] = useState<THeadBlend>({  
//     shapeFirst: 0,
//     shapeSecond: 0,
//     shapeThird: 0,
//     skinFirst: 0,   
//     skinSecond: 0,
//     skinThird: 0,
//     shapeMix: 0.5,
//     skinMix: 0.5,
//     thirdMix: 0.0,
//     hasParent: false,
//   });   

//     // Load initial head blend data
//     useEffect(() => {
