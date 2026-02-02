import { FC, useState, useEffect } from 'react';
import { Box, Button } from '@mantine/core';
import { IconLock } from '../icons/Icons';
import { useAppearanceStore } from '../../Providers/AppearanceStoreProvider';




// Styled Number Stepper Component
export const NumberStepper: FC<{
    value: number;
    min: number;
    max: number;
    blacklist?: number[] | null;
    onChange: (value: number) => void;
}> = ({ value, min, max,blacklist, onChange }) => {
    const [isLeftHovered, setIsLeftHovered] = useState(false);
    const [isRightHovered, setIsRightHovered] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    const { isValid, setIsValid } = useAppearanceStore();

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const [isBlacklisted, setIsBlacklisted] = useState(false);

    useEffect(() => {
        checkBlacklist();
    }, [value, blacklist]);

    function checkBlacklist() {
        const blacklisted = Array.isArray(blacklist) ? blacklist.includes(value) : false;
        setIsBlacklisted(blacklisted);
        setIsValid({ ...isValid, drawables: !blacklisted });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue)) {
            const clampedValue = Math.max(min, Math.min(max, numValue));
            onChange(clampedValue);
            setInputValue(clampedValue.toString());
        } else {
            setInputValue(value.toString());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
            (e.target as HTMLInputElement).blur();
        }
    };

    return (


        <Box style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
            <Button
                size="xs"
                variant="default"
                onClick={() => {
                    const next = value - 1;
                    onChange(next < min ? max : next);
                }}
                onMouseEnter={() => setIsLeftHovered(true)}
                onMouseLeave={() => setIsLeftHovered(false)}
                style={{
                    minWidth: '2rem',
                    height: '2.125rem',
                    padding: '0',
                    backgroundColor: isLeftHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                ◂
            </Button>
            <Box style={{ position: 'relative', flex: 1 }}>
                <Box
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '-1.7rem',
                        transform: 'translateX(-50%)',
                        opacity: isBlacklisted ? 0.75 : 0,
                        pointerEvents: 'none',
                        animation: 'pulse 1.5s infinite',
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <IconLock size={20} />
                </Box>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyPress={handleKeyPress}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '0',
                        textAlign: 'center',
                        flex: 1,
                        height: '2.125rem',
                        width: '100%',
                        minWidth: '4rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        outline: 'none',
                        borderRadius: '0.125rem',
                        boxSizing: 'border-box',
                    }}
                />
            </Box>
            <Button
                size="xs"
                variant="default"
                onClick={() => {
                    const next = value + 1;
                    onChange(next > max ? min : next);
                }}
                onMouseEnter={() => setIsRightHovered(true)}
                onMouseLeave={() => setIsRightHovered(false)}
                style={{
                    minWidth: '2rem',
                    height: '2.125rem',
                    padding: '0',
                    backgroundColor: isRightHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                ▸
            </Button>
        </Box>
    );
};