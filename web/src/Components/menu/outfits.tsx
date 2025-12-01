import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Divider, Group, Input, NumberInput, Stack, Text, Paper, Grid } from '@mantine/core';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';
import type { TOutfitData } from '../../types/appearance';
import { IconCancel } from '../icons/IconCancel';
import { IconCheck } from '../icons/IconCheck';
import { IconPlus } from '../icons/IconPlus';
import { IconImport } from '../icons/IconImport';
import { Menu } from '@mantine/core';

const Outfits: React.FC = () => {
        // Inject animation keyframes once
        useEffect(() => {
            if (!document.getElementById('fadeScaleIn-keyframes')) {
                const styleSheet = document.createElement("style");
                styleSheet.id = 'fadeScaleIn-keyframes';
                styleSheet.innerText = `
                @keyframes fadeScaleIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                `;
                document.head.appendChild(styleSheet);
            }
        }, []);
    const { outfits, locale, jobData, editOutfit, useOutfit, shareOutfit, itemOutfit, deleteOutfit, saveOutfit, importOutfit } = useAppearanceStore();

    const [renameIndex, setRenameIndex] = useState<number>(-1);
    const [renameLabel, setRenameLabel] = useState<string>('');
    const [deleteIndex, setDeleteIndex] = useState<number>(-1);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isJobAdding, setIsJobAdding] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [newOutfitLabel, setNewOutfitLabel] = useState<string>('');
    const [newOutfitJobRank, setNewOutfitJobRank] = useState<number>(0);
    const [importOutfitId, setImportOutfitId] = useState<number>(0);
    const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

    const handleRename = (index: number) => {
        if (renameLabel.length > 0 && outfits && outfits[index]) {
            editOutfit({ ...outfits[index], label: renameLabel });
            setRenameIndex(-1);
            setRenameLabel('');
        }
    };

    const ShrinkText = ({ children }: { children: React.ReactNode }) => {
        const ref = useRef<HTMLSpanElement>(null);

        useEffect(() => {
            const el = ref.current;
            if (!el) return;

            let size = 16; // starting font size
            el.style.fontSize = size + "px";

            // Reduce until fits
            while (el.scrollWidth > el.clientWidth && size > 8) {
                size -= 1;
                el.style.fontSize = size + "px";
            }
        }, [children]);

        return (
            <span
                ref={ref}
                style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    minWidth: 0,
                    maxWidth: "100%",
                }}
            >
                {children}
            </span>
        );
    };


    const handleOutfitAction = (
        action: string,
        index: number,
        outfit?: TOutfitData,
        label?: string
    ) => {
        switch (action) {
            case 'use':
                if (outfit) useOutfit(outfit);
                break;
            case 'share':
                shareOutfit(index);
                break;
            case 'item':
                if (outfit) itemOutfit(outfit, renameLabel !== '' ? renameLabel : (label ?? ''));
                break;
            case 'delete':
                deleteOutfit(index);
                break;
            default:
                break;
        }
    };

    const resetNewOutfitFields = () => {
        setIsAdding(false);
        setIsJobAdding(false);
        setNewOutfitLabel('');
        setNewOutfitJobRank(0);
    };

    const resetImportFields = () => {
        setIsImporting(false);
        setImportOutfitId(0);
    };

    return (
        <Stack spacing="lg"
            className="appearance-scroll"
            style={{
                padding: '0.25rem 0.75rem',
                width: '18rem',
                maxWidth: '400px',
                height: "100%",
                maxHeight: "100%",
                overflowY: "auto",   // browser scroll only
                overflowX: "hidden",
                paddingBottom: "2rem",  // ⬅️ Add bottom padding here
            }}>


            {outfits && outfits.length > 0 ? (
                outfits.map(({ label, outfit, id, jobname }: any, i: number) => (
                    <React.Fragment key={id || i}>

                        <Box>

                            <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">{jobname ? `${label} | JOB` : label || 'Mother'}</Text>
                            <Button

                                fullWidth
                                radius="md"
                                style={{ fontWeight: 600, letterSpacing: 1, marginBottom: 4,background: "rgba(0,0,0,0.6)", }}
                                onClick={() => setActiveDropdownIndex(activeDropdownIndex === i ? -1 : i)}
                            >
                                {locale.OPTIONS_TITLE ?? "Options"}
                            </Button>
                            {activeDropdownIndex === i && (

                                <Paper
                                    shadow="md"
                                    radius="md"
                                    p="md"
                                    style={{
                                        background: '#23272f',
                                        marginTop: 10,
                                        zIndex: 10,
                                        animation: 'fadeScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                >

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'nowrap',
                                        justifyContent: 'center',
                                        gap: '0.3rem',
                                        width: '100%',
                                    }}>
                                        <Button size="xs" variant="light" color="blue" radius="md" style={{ fontWeight: 500, minWidth: 70, paddingLeft: 4, paddingRight: 4 }} onClick={() => handleOutfitAction('use', i, outfit)}>
                                            <ShrinkText>{locale.USE_TITLE}</ShrinkText>
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="light"
                                            color="yellow"
                                            radius="md"
                                            disabled={!!jobname && !jobData.isBoss}
                                            style={{ fontWeight: 500, minWidth: 70, paddingLeft: 4, paddingRight: 4 }}
                                            onClick={() => { setRenameIndex(i); setRenameLabel(label); }}
                                        >
                                            <ShrinkText>{locale.EDIT_TITLE}</ShrinkText>
                                        </Button>
                                        {!jobname && (
                                            <Button
                                                size="xs"
                                                variant="light"
                                                color="teal"
                                                radius="md"
                                                disabled={!!jobname && !jobData.isBoss}
                                                style={{ fontWeight: 500, minWidth: 70, paddingLeft: 4, paddingRight: 4 }}
                                                onClick={() => handleOutfitAction('share', id)}
                                            >
                                                <ShrinkText>{locale.SHAREOUTFIT_TITLE}</ShrinkText>
                                            </Button>
                                        )}
                                        <Button size="xs" variant="light" color="grape" radius="md" style={{ fontWeight: 500, minWidth: 70, paddingLeft: 4, paddingRight: 4 }} onClick={() => handleOutfitAction('item', i, outfit, label)}>
                                            <ShrinkText>{locale.ITEMOUTFIT_TITLE}</ShrinkText>
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="light"
                                            color="red"
                                            radius="md"
                                            style={{ fontWeight: 500, minWidth: 40, paddingLeft: 4, paddingRight: 4 }}
                                            disabled={!!jobname && !jobData.isBoss}
                                            onClick={() => setDeleteIndex(i)}
                                        >
                                            <IconCancel size={24} />
                                        </Button>
                                    </div>

                                    {renameIndex === i && (
                                        <Group spacing="xs" style={{ justifyContent: 'center', gap: '0.5vh', marginTop: '0.5vh' }}>
                                            <Input
                                                value={renameLabel}
                                                onChange={e => setRenameLabel(e.currentTarget.value)}
                                                placeholder="Rename outfit"
                                            />
                                            <Button size="xs" color="red" radius="md" style={{ aspectRatio: '1/1', padding: '0.5vh' }} onClick={() => setRenameIndex(-1)}>
                                                <IconCancel />
                                            </Button>
                                            <Button size="xs" color="green" radius="md" style={{ aspectRatio: '1/1', padding: '0.5vh' }} onClick={() => handleRename(i)}>
                                                <IconCheck />
                                            </Button>
                                        </Group>
                                    )}

                                    {deleteIndex === i && (
                                        <Group spacing="xs" style={{ justifyContent: 'center', gap: '0.5vh', width: '100%', marginTop: '0.5vh' }}>
                                            <Button size="xs"  radius="md" onClick={() => setDeleteIndex(-1)}>{locale.CANCEL_TITLE}</Button>
                                            <Button size="xs"  color="red" radius="md" onClick={() => handleOutfitAction('delete', id)}>{locale.CONFIRMREM_SUBTITLE}</Button>
                                        </Group>
                                    )}
                                </Paper>

                            )}

                        </Box>
                        <Divider my="sm" />
                    </React.Fragment>
                ))
            ) : (
                <Text fw={600} mb="sm" ta="right" tt="uppercase" size="sm" c="white">
                    {locale.NO_OUTFITS || "You can't modify your makeup"}
                </Text>
            )}

        </Stack >
    );
};

export default Outfits;
