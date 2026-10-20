import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Token,
  MapConfig,
  Combatant,
  PartyMember,
  LibraryEntry,
  TokenSizeType,
  CombatLogEntry,
  MapLayerMode,
  SavedEncounter,
  EncounterLootItem
} from '../../types.ts';
import {
  BattleMapGrid,
  ActiveTargetingAction,
  CORE_COMBAT_ACTIONS,
  BATTLEGROUND_PRESETS,
  MapBrushMode
} from './BattleMapGrid.tsx';
import { CombatLogDrawer } from './CombatLogDrawer.tsx';
import { CharacterBuilderModal } from '../SessionHub/CharacterBuilderModal.tsx';
import { EncyclopediaTooltip } from '../Encyclopedia/EncyclopediaTooltip.tsx';
import { parseMonsterCombatProfile } from '../../utils/monsterCombatParser.ts';
import {
  RollMode,
  rollDiceFormula,
  resolveAttackRoll,
  resolveSavingThrow,
  resolveConcentrationCheck,
  rollMonsterRecharge,
  performShortRest,
  performLongRest,
  getAbilityModifier,
  getProficiencyBonus
} from '../../utils/combatMechanics.ts';
import { playSynthesizedSound } from '../../utils/audioEngine.ts';
import {
  Swords,
  Shield,
  Heart,
  Footprints,
  Sparkles,
  Flame,
  Backpack,
  Award,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Ruler,
  Move,
  Grid,
  Upload,
  Copy,
  Trash2,
  UserCheck,
  Dices,
  X,
  BookOpen,
  Crosshair,
  ScrollText,
  EyeOff,
  Eye,
  Sun,
  Moon,
  UserPlus,
  Layers,
  Lock,
  Unlock,
  Save,
  FolderOpen
} from 'lucide-react';

interface TacticalMapModuleProps {
  tokens: Token[];
  mapConfig: MapConfig;
  combatants: Combatant[];
  party: PartyMember[];
  library: LibraryEntry[];
  round: number;
  turnIndex: number;
  savedEncounters?: SavedEncounter[];
  onUpdateSavedEncounters?: (encounters: SavedEncounter[]) => void;
  onUpdateTokens: (tokens: Token[]) => void;
  onUpdateMapConfig: (config: MapConfig) => void;
  onUpdateCombatants: (combatants: Combatant[]) => void;
  onUpdateParty?: (party: PartyMember[]) => void;
  onUpdateRound: (round: number) => void;
  onUpdateTurnIndex: (turnIndex: number) => void;
  onOpenCharacterSheet?: (member: PartyMember) => void;
  onOpenEncyclopediaEntry?: (entry: LibraryEntry) => void;
}

interface TurnActionEconomy {
  hasAction: boolean;
  hasBonusAction: boolean;
  hasReaction: boolean;
}

export const TacticalMapModule: React.FC<TacticalMapModuleProps> = ({
  tokens,
  mapConfig,
  combatants,
  party,
  library,
  round,
  turnIndex,
  savedEncounters = [],
  onUpdateSavedEncounters,
  onUpdateTokens,
  onUpdateMapConfig,
  onUpdateCombatants,
  onUpdateParty,
  onUpdateRound,
  onUpdateTurnIndex,
  onOpenCharacterSheet,
  onOpenEncyclopediaEntry,
}) => {
  // ==========================================================================
  // CORE ENCOUNTER STATE:
  // 1. playingTokenId -> The character/monster the user is currently "playing" (Bottom BG3 HUD)
  // 2. inspectedTokenId -> The character/monster clicked on the map (Right-Side Interaction Menu)
  // ==========================================================================
  const [playingTokenId, setPlayingTokenId] = useState<string | null>(() => {
    return tokens[0]?.id || null;
  });
  const [inspectedTokenId, setInspectedTokenId] = useState<string | null>(() => {
    return tokens[0]?.id || null;
  });

  // Track token list additions so spawning a monster from Library or Spawn menu immediately focuses it
  const prevTokenIdsRef = useRef<string[]>(tokens.map(t => t.id));
  useEffect(() => {
    const prevIds = prevTokenIdsRef.current;
    if (tokens.length > prevIds.length) {
      const newlyAdded = tokens.find(t => !prevIds.includes(t.id)) || tokens[tokens.length - 1];
      if (newlyAdded) {
        setPlayingTokenId(newlyAdded.id);
        setInspectedTokenId(newlyAdded.id);
      }
    }
    prevTokenIdsRef.current = tokens.map(t => t.id);
  }, [tokens]);

  // Maximize / Fullscreen Map Mode
  const [isMaximized, setIsMaximized] = useState(false);

  // Collapsible HUD States (minimal & distraction-free)
  const [isTopHudCollapsed, setIsTopHudCollapsed] = useState(false);
  const [isBottomHudCollapsed, setIsBottomHudCollapsed] = useState(false);
  const [isRightHudCollapsed, setIsRightHudCollapsed] = useState(false);
  const [showLeftSpawnerMenu, setShowLeftSpawnerMenu] = useState(false);
  const [showMapSettingsMenu, setShowMapSettingsMenu] = useState(false);
  const [showSavedEncountersMenu, setShowSavedEncountersMenu] = useState(false);
  const [showCombatLogDrawer, setShowCombatLogDrawer] = useState(false);
  const [showCharacterBuilderModal, setShowCharacterBuilderModal] = useState(false);

  // Saved Encounter Designer Form State
  const [newEncounterName, setNewEncounterName] = useState('');
  const [newEncounterDesc, setNewEncounterDesc] = useState('');
  const [newLootItemName, setNewLootItemName] = useState('');
  const [newLootItemQty, setNewLootItemQty] = useState(1);

  // Combat Roll Mode (Normal / Advantage / Disadvantage)
  const [rollMode, setRollMode] = useState<RollMode>('normal');

  // Combat Log History
  const [combatLogEntries, setCombatLogEntries] = useState<CombatLogEntry[]>([
    {
      id: 'init_log_1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      round: 1,
      category: 'turn',
      title: 'Encounter Initialized (5e Combat Engine Active)',
      detail: 'Attack Rolls vs AC, Saving Throws vs DC, Concentration Checks, and Recharge 5–6 rolls are active.',
      outcome: 'info',
    },
  ]);

  const appendCombatLog = (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => {
    const fullEntry: CombatLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setCombatLogEntries(prev => [fullEntry, ...prev.slice(0, 99)]);
  };

  // Bottom HUD Active Category Tab
  const [hudCategory, setHudCategory] = useState<'move' | 'actions' | 'spells' | 'items' | 'features'>('actions');
  const [showAllSrdSpells, setShowAllSrdSpells] = useState(false);

  // 3-Layer System:
  // - 'tokens': Play & Combat Mode (architecture/terrain layer is normally invisible except interactive doors)
  // - 'background': Move or Scale background image & grid offset so pre-drawn map grids line up
  // - 'architecture': Draw Walls/Blocks (LOS fog & movement blockers), Openable Doors, Terrain & Fog
  const mapStageWrapperRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerMode>('tokens');
  const [activeTool, setActiveTool] = useState<'move' | 'ruler' | 'target' | 'pan' | 'brush'>('move');
  const [activeBrush, setActiveBrush] = useState<MapBrushMode>('none');
  const [targetingAction, setTargetingAction] = useState<ActiveTargetingAction | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Movement, Action Economy & Expended Recharge abilities per token
  const [tokenMovementSpent, setTokenMovementSpent] = useState<Record<string, number>>({});
  const [isDashing, setIsDashing] = useState<Record<string, boolean>>({});
  const [tokenEconomy, setTokenEconomy] = useState<Record<string, TurnActionEconomy>>({});
  const [tokenMoveMode, setTokenMoveMode] = useState<Record<string, string>>({});
  const [expendedRecharges, setExpendedRecharges] = useState<Record<string, Record<string, number>>>({});

  // Combat Log Banner inside Encounter Canvas
  const [combatLogBanner, setCombatLogBanner] = useState<string | null>(null);
  const triggerCombatBanner = (msg: string) => {
    setCombatLogBanner(msg);
    setTimeout(() => {
      setCombatLogBanner(curr => (curr === msg ? null : curr));
    }, 4500);
  };

  // Ensure playingTokenId stays valid if tokens change
  useEffect(() => {
    if (tokens.length > 0 && (!playingTokenId || !tokens.some(t => t.id === playingTokenId))) {
      setPlayingTokenId(tokens[0].id);
    }
    if (tokens.length > 0 && (!inspectedTokenId || !tokens.some(t => t.id === inspectedTokenId))) {
      setInspectedTokenId(tokens[0].id);
    }
  }, [tokens, playingTokenId, inspectedTokenId]);

  // Escape exits maximize or cancels targeting/brush
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTool === 'target' || activeTool === 'brush') {
          setActiveTool('move');
          setActiveBrush('none');
          setTargetingAction(null);
        } else if (isMaximized) {
          setIsMaximized(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, isMaximized]);

  // Sorted combatants by initiative descending
  const sortedCombatants = useMemo(() => {
    return [...combatants].sort((a, b) => b.initiative - a.initiative);
  }, [combatants]);

  const activeTurnCombatant =
    sortedCombatants.length > 0 ? sortedCombatants[turnIndex % sortedCombatants.length] : null;
  const nextTurnCombatant =
    sortedCombatants.length > 1 ? sortedCombatants[(turnIndex + 1) % sortedCombatants.length] : null;

  const activeTurnTokenId = useMemo(() => {
    if (!activeTurnCombatant) return null;
    if (activeTurnCombatant.tokenId) return activeTurnCombatant.tokenId;
    const match = tokens.find(t => t.name.toLowerCase() === activeTurnCombatant.name.toLowerCase());
    return match?.id || null;
  }, [activeTurnCombatant, tokens]);

  // Helper to resolve PartyMember or LibraryEntry for any token
  const getPartyMemberForToken = (tok: Token | null) => {
    if (!tok) return null;
    const tokName = tok.name.toLowerCase().trim();
    return (
      party.find(p => {
        const pn = p.name.toLowerCase().trim();
        return pn === tokName || pn.startsWith(tokName) || tokName.startsWith(pn);
      }) || null
    );
  };

  const getLibraryEntryForToken = (tok: Token | null) => {
    if (!tok) return null;
    if (tok.libraryEntryId) {
      const found = library.find(e => e.id === tok.libraryEntryId);
      if (found) return found;
    }
    const cleanName = tok.name.replace(/\s+#?\d+$/, '').toLowerCase().trim();
    return (
      library.find(e => e.category === 'monsters' && e.name.toLowerCase().trim() === cleanName) ||
      library.find(e => e.name.toLowerCase().trim() === cleanName) ||
      null
    );
  };

  // Playing Token & Matched Party Member / Monster Entry
  const playingToken = useMemo(
    () => tokens.find(t => t.id === playingTokenId) || null,
    [tokens, playingTokenId]
  );
  const playingPartyMember = useMemo(
    () => getPartyMemberForToken(playingToken),
    [playingToken, party]
  );
  const playingLibraryEntry = useMemo(
    () => getLibraryEntryForToken(playingToken),
    [playingToken, library]
  );
  const playingMonsterProfile = useMemo(() => {
    if (playingPartyMember || !playingLibraryEntry) return null;
    return parseMonsterCombatProfile(playingLibraryEntry, library);
  }, [playingPartyMember, playingLibraryEntry, library]);

  // Inspected Token (Right-Side Menu) & Matched Party Member / Monster Entry
  const inspectedToken = useMemo(
    () => tokens.find(t => t.id === inspectedTokenId) || null,
    [tokens, inspectedTokenId]
  );
  const inspectedPartyMember = useMemo(
    () => getPartyMemberForToken(inspectedToken),
    [inspectedToken, party]
  );
  const inspectedLibraryEntry = useMemo(
    () => getLibraryEntryForToken(inspectedToken),
    [inspectedToken, library]
  );
  const inspectedMonsterProfile = useMemo(() => {
    if (inspectedPartyMember || !inspectedLibraryEntry) return null;
    return parseMonsterCombatProfile(inspectedLibraryEntry, library);
  }, [inspectedPartyMember, inspectedLibraryEntry, library]);

  // Movement calculations for Playing Token (supports Walk, Fly, Swim, Climb, Burrow)
  const activePlayingMoveMode = playingToken ? tokenMoveMode[playingToken.id] || 'Walk' : 'Walk';
  const playingBaseSpeed = useMemo(() => {
    if (playingPartyMember) return playingPartyMember.speed || 30;
    if (playingMonsterProfile) {
      const modeObj = playingMonsterProfile.movementModes.find(m => m.mode === activePlayingMoveMode);
      return modeObj ? modeObj.speed : playingMonsterProfile.baseWalkSpeed;
    }
    return 30;
  }, [playingPartyMember, playingMonsterProfile, activePlayingMoveMode]);

  const playingIsDashing = playingToken ? Boolean(isDashing[playingToken.id]) : false;
  const playingTotalSpeed = playingIsDashing ? playingBaseSpeed * 2 : playingBaseSpeed;
  const playingMoveSpent = playingToken ? tokenMovementSpent[playingToken.id] || 0 : 0;
  const playingMoveRemaining = Math.max(0, playingTotalSpeed - playingMoveSpent);

  // Movement calculations for Inspected Token (Right-side menu)
  const activeInspectedMoveMode = inspectedToken ? tokenMoveMode[inspectedToken.id] || 'Walk' : 'Walk';
  const inspectedBaseSpeed = useMemo(() => {
    if (inspectedPartyMember) return inspectedPartyMember.speed || 30;
    if (inspectedMonsterProfile) {
      const modeObj = inspectedMonsterProfile.movementModes.find(m => m.mode === activeInspectedMoveMode);
      return modeObj ? modeObj.speed : inspectedMonsterProfile.baseWalkSpeed;
    }
    return 30;
  }, [inspectedPartyMember, inspectedMonsterProfile, activeInspectedMoveMode]);

  const inspectedIsDashing = inspectedToken ? Boolean(isDashing[inspectedToken.id]) : false;
  const inspectedTotalSpeed = inspectedIsDashing ? inspectedBaseSpeed * 2 : inspectedBaseSpeed;
  const inspectedMoveSpent = inspectedToken ? tokenMovementSpent[inspectedToken.id] || 0 : 0;
  const inspectedMoveRemaining = Math.max(0, inspectedTotalSpeed - inspectedMoveSpent);

  // Action Economy for Playing Token
  const currentEconomy: TurnActionEconomy = useMemo(() => {
    if (!playingToken) return { hasAction: true, hasBonusAction: true, hasReaction: true };
    return (
      tokenEconomy[playingToken.id] || {
        hasAction: true,
        hasBonusAction: true,
        hasReaction: true,
      }
    );
  }, [playingToken, tokenEconomy]);

  const updatePlayingEconomy = (patch: Partial<TurnActionEconomy>) => {
    if (!playingToken) return;
    setTokenEconomy(prev => ({
      ...prev,
      [playingToken.id]: {
        ...(prev[playingToken.id] || { hasAction: true, hasBonusAction: true, hasReaction: true }),
        ...patch,
      },
    }));
  };

  // Sync HP changes across tokens, combatants, and party
  const syncHpForToken = (tokenId: string, newHp: number) => {
    const targetTok = tokens.find(t => t.id === tokenId);
    if (!targetTok) return;
    const clampedHp = Math.max(0, Math.min(targetTok.maxHp, newHp));

    onUpdateTokens(tokens.map(t => (t.id === tokenId ? { ...t, hp: clampedHp } : t)));

    // Sync combatants
    onUpdateCombatants(
      combatants.map(c =>
        c.tokenId === tokenId || c.name.toLowerCase() === targetTok.name.toLowerCase()
          ? { ...c, hp: clampedHp }
          : c
      )
    );

    // Sync party member if player
    if (onUpdateParty) {
      onUpdateParty(
        party.map(p =>
          p.name.toLowerCase() === targetTok.name.toLowerCase() ||
          p.name.toLowerCase().startsWith(targetTok.name.toLowerCase())
            ? { ...p, hp: clampedHp }
            : p
        )
      );
    }
  };

  // Spend Movement Handler
  const handleSpendMovement = (tokenId: string, feetSpent: number) => {
    setTokenMovementSpent(prev => ({
      ...prev,
      [tokenId]: (prev[tokenId] || 0) + feetSpent,
    }));
  };

  // Switch To Character Handler (from Right-Side Menu or Initiative Bar)
  const handleSwitchToCharacter = (tokenId: string) => {
    const tok = tokens.find(t => t.id === tokenId);
    if (!tok) return;
    setPlayingTokenId(tokenId);
    setInspectedTokenId(tokenId);
    setActiveTool('move');
    setActiveBrush('none');
    setTargetingAction(null);
    triggerCombatBanner(`Now playing as ${tok.name}`);
  };

  // Advance Turn Handler (also rolls Recharge d6 for any expended monster recharge abilities!)
  const handleAdvanceTurn = (delta: number) => {
    if (sortedCombatants.length === 0) return;
    let nextIdx = turnIndex + delta;
    let nextRound = round;
    if (nextIdx >= sortedCombatants.length) {
      nextIdx = 0;
      nextRound = round + 1;
      onUpdateRound(nextRound);
    } else if (nextIdx < 0) {
      nextIdx = sortedCombatants.length - 1;
      nextRound = Math.max(1, round - 1);
      onUpdateRound(nextRound);
    }
    onUpdateTurnIndex(nextIdx);

    const nextComb = sortedCombatants[nextIdx];
    if (nextComb) {
      const matchTok =
        tokens.find(t => t.id === nextComb.tokenId) ||
        tokens.find(t => t.name.toLowerCase() === nextComb.name.toLowerCase());
      if (matchTok) {
        // Reset movement, dash, and action economy for the new turn's character
        setTokenMovementSpent(prev => ({ ...prev, [matchTok.id]: 0 }));
        setIsDashing(prev => ({ ...prev, [matchTok.id]: false }));
        setTokenEconomy(prev => ({
          ...prev,
          [matchTok.id]: { hasAction: true, hasBonusAction: true, hasReaction: true },
        }));

        // Check if this creature has any expended Recharge abilities (e.g. Dragon Breath 5-6)
        const tokenRecharges = expendedRecharges[matchTok.id];
        if (tokenRecharges && Object.keys(tokenRecharges).length > 0) {
          const updatedTokRecharges = { ...tokenRecharges };
          for (const [actName, minNeed] of Object.entries(tokenRecharges)) {
            const rechRes = rollMonsterRecharge(actName, minNeed);
            appendCombatLog({
              round: nextRound,
              category: 'recharge',
              title: `${matchTok.name}: ${rechRes.summary}`,
              detail: rechRes.recharged
                ? `${actName} is ready to use again!`
                : `${actName} remains on cooldown.`,
              outcome: rechRes.recharged ? 'hit' : 'info',
            });
            if (rechRes.recharged) {
              delete updatedTokRecharges[actName];
            }
          }
          setExpendedRecharges(prev => ({ ...prev, [matchTok.id]: updatedTokRecharges }));
        }

        setPlayingTokenId(matchTok.id);
        setInspectedTokenId(matchTok.id);
        appendCombatLog({
          round: nextRound,
          category: 'turn',
          title: `Turn Started: ${matchTok.name} (Round ${nextRound})`,
          detail: `Movement & Action Economy refreshed.`,
          outcome: 'info',
        });
        triggerCombatBanner(`Turn: ${matchTok.name} (Round ${nextRound})`);
      }
    }
  };

  // Roll Initiative for All Tokens on Map
  const handleRollAllInitiative = () => {
    try {
      playSynthesizedSound('dice');
    } catch {}
    const nextCombatants: Combatant[] = tokens.map(tok => {
      const existing = combatants.find(
        c => c.tokenId === tok.id || c.name.toLowerCase() === tok.name.toLowerCase()
      );
      const pm = getPartyMemberForToken(tok);
      const libEnt = getLibraryEntryForToken(tok);
      const dexScore = pm?.abilities?.dex ?? libEnt?.stats?.abilities?.dex ?? 12;
      const dexMod = getAbilityModifier(dexScore);
      const roll = Math.max(1, Math.floor(Math.random() * 20) + 1 + dexMod);
      return {
        id: existing?.id || `comb_${tok.id}`,
        tokenId: tok.id,
        name: tok.name,
        initiative: roll,
        hp: tok.hp,
        maxHp: tok.maxHp,
        ac: tok.ac,
        conditions: tok.conditions,
        isPlayer: tok.type === 'player',
        color: tok.color,
      };
    });
    onUpdateCombatants(nextCombatants);
    onUpdateTurnIndex(0);
    appendCombatLog({
      round,
      category: 'turn',
      title: `Rolled Initiative for ${nextCombatants.length} combatants`,
      detail: nextCombatants
        .sort((a, b) => b.initiative - a.initiative)
        .map(c => `${c.name}: ${c.initiative}`)
        .join(' • '),
      outcome: 'info',
    });
    triggerCombatBanner(`Rolled Initiative for ${nextCombatants.length} combatants!`);
  };

  // Start Targeting or Immediate Self-Execution for an Action / Spell / Item
  const handleActivateActionOrSpell = (action: ActiveTargetingAction) => {
    if (!playingToken) return;

    // Check if Recharge ability is currently on cooldown
    const cooldownMin = expendedRecharges[playingToken.id]?.[action.name];
    if (cooldownMin) {
      const rechRes = rollMonsterRecharge(action.name, cooldownMin);
      appendCombatLog({
        round,
        category: 'recharge',
        title: `${playingToken.name}: ${rechRes.summary}`,
        detail: rechRes.recharged ? `${action.name} recharged!` : `Still recharging (needs ${cooldownMin}–6 on d6).`,
        outcome: rechRes.recharged ? 'hit' : 'miss',
      });
      if (rechRes.recharged) {
        setExpendedRecharges(prev => {
          const next = { ...(prev[playingToken.id] || {}) };
          delete next[action.name];
          return { ...prev, [playingToken.id]: next };
        });
        triggerCombatBanner(`${action.name} RECHARGED (rolled ${rechRes.roll})! Click again to target.`);
      } else {
        triggerCombatBanner(`${action.name} did not recharge (rolled ${rechRes.roll} on d6, needs ${cooldownMin}–6).`);
      }
      return;
    }

    // Check spell slot availability if leveled spell for party member
    if (action.spellLevel && action.spellLevel > 0 && playingPartyMember?.spellcasting) {
      const slotIdx = action.spellLevel - 1;
      const maxSlots = playingPartyMember.spellcasting.slotsMax?.[slotIdx] || 0;
      const usedSlots = playingPartyMember.spellcasting.slotsUsed?.[slotIdx] || 0;
      if (maxSlots > 0 && usedSlots >= maxSlots) {
        triggerCombatBanner(`No Level ${action.spellLevel} Spell Slots remaining for ${playingToken.name}!`);
        return;
      }
    }

    // Immediate self-actions (e.g., Dash, Dodge, Disengage, Shield, Invisibility, Enlarge)
    if (action.aoeShape === 'self' && !action.damage && !action.healing) {
      if (action.name.toLowerCase().includes('dash')) {
        setIsDashing(prev => ({ ...prev, [playingToken.id]: true }));
      }
      if (action.actionCost === 'Action') updatePlayingEconomy({ hasAction: false });
      if (action.actionCost === 'Bonus Action') updatePlayingEconomy({ hasBonusAction: false });
      if (action.actionCost === 'Reaction') updatePlayingEconomy({ hasReaction: false });

      if (action.spellLevel && action.spellLevel > 0 && playingPartyMember?.spellcasting && onUpdateParty) {
        const slotIdx = action.spellLevel - 1;
        const nextUsed = [...(playingPartyMember.spellcasting.slotsUsed || [0, 0, 0])];
        nextUsed[slotIdx] = Math.min(
          playingPartyMember.spellcasting.slotsMax?.[slotIdx] || 0,
          (nextUsed[slotIdx] || 0) + 1
        );
        onUpdateParty(
          party.map(p =>
            p.id === playingPartyMember.id && p.spellcasting
              ? { ...p, spellcasting: { ...p.spellcasting, slotsUsed: nextUsed } }
              : p
          )
        );
      }

      appendCombatLog({
        round,
        category: 'utility',
        title: `${playingToken.name} used ${action.name}`,
        detail: action.desc || `${action.actionCost} expended.`,
        outcome: 'info',
      });
      triggerCombatBanner(`${playingToken.name} used ${action.name}!`);
      return;
    }

    // Enter interactive map targeting mode
    setTargetingAction(action);
    setActiveTool('target');
    setActiveBrush('none');
  };

  // Execute Targeted Action on Map Click (with Full 5e Attack Rolls vs AC, Saving Throws vs DC, Concentration, and Recharge!)
  const handleExecuteTargetedAction = (
    targetTokenIds: string[],
    targetPoint: { x: number; y: number }
  ) => {
    if (!playingToken || !targetingAction) return;

    // Special case: Misty Step / Teleport / Jump
    if (
      targetingAction.name.toLowerCase().includes('misty step') ||
      targetingAction.name.toLowerCase().includes('teleport') ||
      targetingAction.name.toLowerCase().includes('reposition')
    ) {
      const nextTokens = tokens.map(t =>
        t.id === playingToken.id ? { ...t, gridX: targetPoint.x, gridY: targetPoint.y } : t
      );
      onUpdateTokens(nextTokens);
      updatePlayingEconomy({ hasBonusAction: false });
      if (targetingAction.spellLevel && playingPartyMember?.spellcasting && onUpdateParty) {
        const slotIdx = targetingAction.spellLevel - 1;
        const nextUsed = [...(playingPartyMember.spellcasting.slotsUsed || [0, 0, 0])];
        nextUsed[slotIdx] = (nextUsed[slotIdx] || 0) + 1;
        onUpdateParty(
          party.map(p =>
            p.id === playingPartyMember.id && p.spellcasting
              ? { ...p, spellcasting: { ...p.spellcasting, slotsUsed: nextUsed } }
              : p
          )
        );
      }
      setActiveTool('move');
      setTargetingAction(null);
      appendCombatLog({
        round,
        category: 'utility',
        title: `${playingToken.name} teleported with ${targetingAction.name}`,
        detail: `Moved to grid cell (${targetPoint.x}, ${targetPoint.y}).`,
        outcome: 'info',
      });
      triggerCombatBanner(`${playingToken.name} used ${targetingAction.name} to (${targetPoint.x}, ${targetPoint.y})!`);
      return;
    }

    if (targetTokenIds.length === 0) {
      triggerCombatBanner(`No target in area for ${targetingAction.name} — click a token or right-click to cancel.`);
      return;
    }

    try {
      playSynthesizedSound(
        targetingAction.healing
          ? 'heal'
          : targetingAction.spellLevel !== undefined || targetingAction.saveType
          ? 'magic'
          : 'sword'
      );
    } catch {}

    // Determine attacker's default attack bonus & save DC
    const defaultAttackBonus =
      targetingAction.attackBonus ??
      (playingPartyMember
        ? targetingAction.spellLevel !== undefined
          ? playingPartyMember.spellcasting?.spellAttackBonus ?? 6
          : getProficiencyBonus(playingPartyMember.level) +
            Math.max(
              getAbilityModifier(playingPartyMember.abilities?.str ?? 14),
              getAbilityModifier(playingPartyMember.abilities?.dex ?? 14)
            )
        : 6);

    const defaultSaveDc =
      targetingAction.saveDc ??
      playingPartyMember?.spellSaveDc ??
      playingPartyMember?.spellcasting?.spellSaveDc ??
      14;

    const hasSculptSpells = Boolean(
      playingPartyMember?.features?.some(f => f.name.toLowerCase().includes('sculpt spells'))
    );

    // Pre-roll shared AoE damage or healing when it's a saving-throw or healing effect
    const sharedDamageRoll =
      targetingAction.damage && targetingAction.saveType
        ? rollDiceFormula(targetingAction.damage, false)
        : undefined;
    const sharedHealRoll = targetingAction.healing
      ? rollDiceFormula(targetingAction.healing, false)
      : undefined;

    const bannerSummaries: string[] = [];

    const nextTokens = tokens.map(t => {
      if (!targetTokenIds.includes(t.id)) return t;

      const targetPartyMember = getPartyMemberForToken(t);
      const targetLibEntry = getLibraryEntryForToken(t);
      const targetAbilities = targetPartyMember?.abilities || targetLibEntry?.stats?.abilities;
      const targetCoverBonus =
        mapConfig.terrainCells?.[`${t.gridX},${t.gridY}`] === 'cover' ? 2 : 0;
      const effectiveAc = t.ac + targetCoverBonus;

      // CASE 1: Healing Action / Spell / Potion
      if (targetingAction.healing && sharedHealRoll) {
        const nextHp = Math.min(t.maxHp, t.hp + sharedHealRoll.total);
        const healedAmt = nextHp - t.hp;
        const msg = `${playingToken.name} healed ${t.name} for +${healedAmt} HP (${sharedHealRoll.breakdown})`;
        bannerSummaries.push(`${t.name} +${healedAmt} HP`);
        appendCombatLog({
          round,
          category: 'heal',
          title: `${playingToken.name} → ${targetingAction.name} on ${t.name}`,
          detail: `${msg} → ${nextHp}/${t.maxHp} HP`,
          outcome: 'hit',
        });
        return { ...t, hp: nextHp };
      }

      // CASE 2: Saving Throw Action / AoE (e.g. Fireball, Lightning Breath, Repulsion Breath, Sacred Flame)
      if (targetingAction.saveType) {
        // Check Evoker's Sculpt Spells protection for allied tokens in AoE
        if (
          hasSculptSpells &&
          playingToken.type === 'player' &&
          t.type === 'player' &&
          t.id !== playingToken.id &&
          targetingAction.damage
        ) {
          bannerSummaries.push(`${t.name}: Sculpt Spells (0 dmg)`);
          appendCombatLog({
            round,
            category: 'save',
            title: `Sculpt Spells protected ${t.name} from ${targetingAction.name}`,
            detail: `Auto-succeeded save and took 0 damage.`,
            outcome: 'save_pass',
          });
          return t;
        }

        const saveRes = resolveSavingThrow({
          casterName: playingToken.name,
          targetName: t.name,
          actionName: targetingAction.name,
          saveType: targetingAction.saveType,
          fallbackDc: defaultSaveDc,
          targetAbilities,
          targetProficientSaves: targetPartyMember?.savingThrows,
          targetLevel: targetPartyMember?.level || 5,
          preRolledDamage: sharedDamageRoll,
          damageType: targetingAction.damageType || 'Magical',
          rollMode,
        });

        let nextConditions = [...t.conditions];
        // Apply Prone if failed Repulsion Breath or Knockdown save
        if (
          !saveRes.saved &&
          /prone/i.test(targetingAction.desc || '') &&
          !nextConditions.includes('Prone')
        ) {
          nextConditions.push('Prone');
        }

        const nextHp = Math.max(0, t.hp - saveRes.appliedDamage);

        // Concentration check if target is Concentrating and took damage
        if (saveRes.appliedDamage > 0 && nextConditions.includes('Concentrating')) {
          const concRes = resolveConcentrationCheck({
            characterName: t.name,
            damageTaken: saveRes.appliedDamage,
            conScore: targetAbilities?.con ?? 14,
            isProficientInConSave: Boolean(targetPartyMember?.savingThrows?.con),
            level: targetPartyMember?.level || 5,
          });
          if (!concRes.passed) {
            nextConditions = nextConditions.filter(c => c !== 'Concentrating');
          }
          appendCombatLog({
            round,
            category: 'concentration',
            title: concRes.summary,
            detail: `Took ${saveRes.appliedDamage} damage from ${targetingAction.name}.`,
            outcome: concRes.passed ? 'save_pass' : 'save_fail',
          });
        }

        bannerSummaries.push(
          `${t.name} ${saveRes.saved ? 'SAVED' : 'FAILED'} (${saveRes.saveTotal} vs DC ${saveRes.dc})${
            saveRes.appliedDamage > 0 ? ` -${saveRes.appliedDamage} HP` : ''
          }`
        );

        appendCombatLog({
          round,
          category: 'save',
          title: saveRes.summary,
          detail: sharedDamageRoll
            ? `Roll: ${sharedDamageRoll.breakdown} = ${sharedDamageRoll.total} (${
                saveRes.saved ? 'Half on Save' : 'Full Damage'
              }) • HP: ${nextHp}/${t.maxHp}`
            : `Save Roll: ${saveRes.saveTotal} vs DC ${saveRes.dc}`,
          outcome: saveRes.saved ? 'save_pass' : 'save_fail',
        });

        return { ...t, hp: nextHp, conditions: nextConditions };
      }

      // CASE 3: Attack Roll vs Target AC (Weapons, Rend, Multiattack, Fire Bolt, Guiding Bolt, etc.)
      if (targetingAction.damage) {
        const atkRes = resolveAttackRoll({
          attackerName: playingToken.name,
          targetName: t.name,
          actionName: targetingAction.name,
          attackBonus: defaultAttackBonus,
          targetAc: effectiveAc,
          damageFormula: targetingAction.damage,
          damageType: targetingAction.damageType || 'Physical',
          rollMode,
        });

        let nextHp = t.hp;
        let nextConditions = [...t.conditions];

        if (atkRes.hit) {
          nextHp = Math.max(0, t.hp - atkRes.damageTotal);

          if (atkRes.damageTotal > 0 && nextConditions.includes('Concentrating')) {
            const concRes = resolveConcentrationCheck({
              characterName: t.name,
              damageTaken: atkRes.damageTotal,
              conScore: targetAbilities?.con ?? 14,
              isProficientInConSave: Boolean(targetPartyMember?.savingThrows?.con),
              level: targetPartyMember?.level || 5,
            });
            if (!concRes.passed) {
              nextConditions = nextConditions.filter(c => c !== 'Concentrating');
            }
            appendCombatLog({
              round,
              category: 'concentration',
              title: concRes.summary,
              detail: `Took ${atkRes.damageTotal} damage from ${targetingAction.name}.`,
              outcome: concRes.passed ? 'save_pass' : 'save_fail',
            });
          }
        }

        bannerSummaries.push(
          atkRes.isCrit
            ? `CRIT ${t.name} (-${atkRes.damageTotal} HP)!`
            : atkRes.hit
            ? `HIT ${t.name} (${atkRes.attackTotal} vs AC ${effectiveAc}) -${atkRes.damageTotal} HP`
            : `MISSED ${t.name} (${atkRes.attackTotal} vs AC ${effectiveAc})`
        );

        appendCombatLog({
          round,
          category: 'attack',
          title: atkRes.summary,
          detail: atkRes.hit
            ? `Target HP: ${nextHp}/${t.maxHp}${targetCoverBonus ? ' (Target had +2 AC Cover)' : ''}`
            : `Attack Roll ${atkRes.attackTotal} did not beat AC ${effectiveAc}.`,
          outcome: atkRes.isCrit ? 'crit' : atkRes.hit ? 'hit' : 'miss',
        });

        return { ...t, hp: nextHp, conditions: nextConditions };
      }

      // CASE 4: Utility targeted action (Help, Search, etc.)
      bannerSummaries.push(`${targetingAction.name} on ${t.name}`);
      appendCombatLog({
        round,
        category: 'utility',
        title: `${playingToken.name} used ${targetingAction.name} on ${t.name}`,
        detail: targetingAction.desc || '',
        outcome: 'info',
      });
      return t;
    });

    onUpdateTokens(nextTokens);

    // If this action has a Recharge (e.g. Lightning Breath Recharge 5-6), mark it expended on the caster
    if (targetingAction.rechargeMin) {
      setExpendedRecharges(prev => ({
        ...prev,
        [playingToken.id]: {
          ...(prev[playingToken.id] || {}),
          [targetingAction.name]: targetingAction.rechargeMin!,
        },
      }));
    }

    // Sync Combatants HP & Conditions
    onUpdateCombatants(
      combatants.map(c => {
        const matchedTok = nextTokens.find(
          t => t.id === c.tokenId || t.name.toLowerCase() === c.name.toLowerCase()
        );
        return matchedTok ? { ...c, hp: matchedTok.hp, conditions: matchedTok.conditions } : c;
      })
    );

    // Sync Party HP, Spell Slots, and Consumable Item Quantities
    if (onUpdateParty) {
      onUpdateParty(
        party.map(p => {
          const matchedTok = nextTokens.find(
            t =>
              p.name.toLowerCase() === t.name.toLowerCase() ||
              p.name.toLowerCase().startsWith(t.name.toLowerCase())
          );
          let updatedMember = matchedTok ? { ...p, hp: matchedTok.hp } : { ...p };

          if (playingPartyMember && p.id === playingPartyMember.id) {
            // Deduct spell slot if leveled spell
            if (targetingAction.spellLevel && targetingAction.spellLevel > 0 && updatedMember.spellcasting) {
              const slotIdx = targetingAction.spellLevel - 1;
              const nextUsed = [...(updatedMember.spellcasting.slotsUsed || [0, 0, 0])];
              nextUsed[slotIdx] = Math.min(
                updatedMember.spellcasting.slotsMax?.[slotIdx] || 0,
                (nextUsed[slotIdx] || 0) + 1
              );
              updatedMember = {
                ...updatedMember,
                spellcasting: { ...updatedMember.spellcasting, slotsUsed: nextUsed },
              };
            }

            // Deduct item quantity if consumable item
            if (targetingAction.itemIndex !== undefined && updatedMember.equipment) {
              const nextEquip = updatedMember.equipment
                .map((item, idx) =>
                  idx === targetingAction.itemIndex ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter(item => item.quantity > 0);
              updatedMember = { ...updatedMember, equipment: nextEquip };
            }
          }

          return updatedMember;
        })
      );
    }

    // Deduct Action / Bonus Action / Reaction
    if (targetingAction.actionCost === 'Action') updatePlayingEconomy({ hasAction: false });
    if (targetingAction.actionCost === 'Bonus Action') updatePlayingEconomy({ hasBonusAction: false });
    if (targetingAction.actionCost === 'Reaction') updatePlayingEconomy({ hasReaction: false });

    triggerCombatBanner(`${playingToken.name} (${targetingAction.name}): ${bannerSummaries.join(' • ')}`);
    setActiveTool('move');
    setTargetingAction(null);
  };

  // Short Rest & Long Rest from Encounter HUD
  const handleEncounterShortRest = () => {
    if (!playingToken) return;
    if (playingPartyMember && onUpdateParty) {
      const res = performShortRest(playingPartyMember, 1);
      onUpdateParty(party.map(p => (p.id === playingPartyMember.id ? res.updatedMember : p)));
      syncHpForToken(playingToken.id, res.updatedMember.hp);
      updatePlayingEconomy({ hasAction: true, hasBonusAction: true, hasReaction: true });
      setTokenMovementSpent(prev => ({ ...prev, [playingToken.id]: 0 }));
      appendCombatLog({
        round,
        category: 'rest',
        title: res.summary,
        detail: `Action economy and short-rest features refreshed.`,
        outcome: 'hit',
      });
      triggerCombatBanner(res.summary);
    } else {
      const healAmt = Math.max(4, Math.floor(playingToken.maxHp * 0.25));
      syncHpForToken(playingToken.id, playingToken.hp + healAmt);
      setExpendedRecharges(prev => ({ ...prev, [playingToken.id]: {} }));
      triggerCombatBanner(`${playingToken.name} took a Short Rest (+${healAmt} HP & recharges restored).`);
    }
  };

  const handleEncounterLongRest = () => {
    if (!playingToken) return;
    if (playingPartyMember && onUpdateParty) {
      const res = performLongRest(playingPartyMember);
      onUpdateParty(party.map(p => (p.id === playingPartyMember.id ? res.updatedMember : p)));
      syncHpForToken(playingToken.id, res.updatedMember.hp);
      updatePlayingEconomy({ hasAction: true, hasBonusAction: true, hasReaction: true });
      setTokenMovementSpent(prev => ({ ...prev, [playingToken.id]: 0 }));
      appendCombatLog({
        round,
        category: 'rest',
        title: res.summary,
        detail: `All spell slots, Hit Dice, and HP restored to full.`,
        outcome: 'hit',
      });
      triggerCombatBanner(res.summary);
    } else {
      syncHpForToken(playingToken.id, playingToken.maxHp);
      setExpendedRecharges(prev => ({ ...prev, [playingToken.id]: {} }));
      triggerCombatBanner(`${playingToken.name} completed a Long Rest (Full HP restored).`);
    }
  };

  // Quick Spawn Helpers
  const spawnPartyToken = (member: PartyMember) => {
    const existing = tokens.find(t => t.name.toLowerCase() === member.name.toLowerCase());
    if (existing) {
      setPlayingTokenId(existing.id);
      setInspectedTokenId(existing.id);
      return;
    }

    const newToken: Token = {
      id: `tok_${Date.now()}`,
      name: member.name,
      gridX: Math.floor(Math.random() * 4) + 4,
      gridY: Math.floor(Math.random() * 4) + 6,
      size: 1,
      hp: member.hp,
      maxHp: member.maxHp,
      ac: member.ac,
      color: member.color,
      type: 'player',
      conditions: [],
    };

    onUpdateTokens([...tokens, newToken]);

    if (!combatants.some(c => c.name === member.name)) {
      const newCombatant: Combatant = {
        id: `comb_${Date.now()}`,
        tokenId: newToken.id,
        name: member.name,
        initiative: Math.floor(Math.random() * 20) + 1,
        hp: member.hp,
        maxHp: member.maxHp,
        ac: member.ac,
        conditions: [],
        isPlayer: true,
        color: member.color,
      };
      onUpdateCombatants([...combatants, newCombatant]);
    }

    setPlayingTokenId(newToken.id);
    setInspectedTokenId(newToken.id);
    triggerCombatBanner(`Spawned ${member.name} into Encounter`);
  };

  const spawnMonsterToken = (entry: LibraryEntry) => {
    const hpVal = typeof entry.stats?.hp === 'number' ? entry.stats.hp : 15;
    const acVal = typeof entry.stats?.ac === 'number' ? entry.stats.ac : 13;
    const s = (entry.stats?.size || '').toLowerCase();
    const sizeVal = s.includes('gargantuan') ? 4 : s.includes('huge') ? 3 : s.includes('large') ? 2 : 1;

    const count = tokens.filter(t => t.name.startsWith(entry.name)).length;
    const tokenName = count > 0 ? `${entry.name} ${count + 1}` : entry.name;

    const newToken: Token = {
      id: `tok_${Date.now()}`,
      name: tokenName,
      gridX: Math.floor(Math.random() * 5) + 11,
      gridY: Math.floor(Math.random() * 5) + 5,
      size: sizeVal as any,
      hp: hpVal,
      maxHp: hpVal,
      ac: acVal,
      color: '#ef4444',
      type: 'enemy',
      conditions: [],
      libraryEntryId: entry.id,
    };

    onUpdateTokens([...tokens, newToken]);

    const newCombatant: Combatant = {
      id: `comb_${Date.now()}`,
      tokenId: newToken.id,
      name: tokenName,
      initiative: Math.floor(Math.random() * 20) + 1,
      hp: hpVal,
      maxHp: hpVal,
      ac: acVal,
      conditions: [],
      isPlayer: false,
      color: '#ef4444',
    };
    onUpdateCombatants([...combatants, newCombatant]);
    setPlayingTokenId(newToken.id);
    setInspectedTokenId(newToken.id);
    appendCombatLog({
      round,
      category: 'turn',
      title: `Spawned ${tokenName} (${entry.stats?.size || 'Medium'} ${entry.stats?.type || 'Monster'}, AC ${acVal}, ${hpVal} HP)`,
      detail: `Loaded full SRD combat profile into Encounter HUD.`,
      outcome: 'info',
    });
    triggerCombatBanner(`Spawned ${tokenName} into Encounter`);
  };

  // Fit the entire gridCols x gridRows map into the visible Encounter viewport
  const fitMapAndGridToViewport = (cols = mapConfig.gridCols || 28, rows = mapConfig.gridRows || 20, cellPx = mapConfig.gridSize || 52) => {
    const gridW = cols * cellPx;
    const gridH = rows * cellPx;
    const wrapperEl = mapStageWrapperRef.current;
    const viewW = wrapperEl ? wrapperEl.clientWidth : 1280;
    const viewH = wrapperEl ? wrapperEl.clientHeight : 760;

    // Reserve breathing room for top initiative ribbon and bottom BG3 HUD
    const padX = 48;
    const padY = 140;
    const availW = Math.max(320, viewW - padX * 2);
    const availH = Math.max(240, viewH - padY);
    const fittedZoom = Math.max(0.45, Math.min(2.0, Number(Math.min(availW / gridW, availH / gridH).toFixed(2))));

    // BattleMapGrid positions the stage with `left-6 top-6` (24px, 24px)
    const centeredPanX = Math.round((viewW - gridW * fittedZoom) / 2 - 24);
    const centeredPanY = Math.round((viewH - 40 - gridH * fittedZoom) / 2 - 24);

    setZoom(fittedZoom);
    setPan({ x: Math.max(-120, centeredPanX), y: Math.max(28, centeredPanY) });
  };

  // Scale Map to Fit Grid: aligns background map 1:1 with the tactical grid and frames it in viewport
  const handleScaleMapToFitGrid = (options?: { matchAspectToImage?: boolean }) => {
    let nextCols = mapConfig.gridCols || 28;
    let nextRows = mapConfig.gridRows || 20;
    const nextCellSize = mapConfig.gridSize || 52;

    if (
      options?.matchAspectToImage &&
      mapConfig.imageNaturalWidth &&
      mapConfig.imageNaturalHeight &&
      mapConfig.imageNaturalHeight > 0
    ) {
      const aspect = mapConfig.imageNaturalWidth / mapConfig.imageNaturalHeight;
      nextCols = Math.max(10, Math.min(60, nextCols));
      nextRows = Math.max(8, Math.min(60, Math.round(nextCols / aspect)));
    }

    onUpdateMapConfig({
      ...mapConfig,
      gridCols: nextCols,
      gridRows: nextRows,
      gridSize: nextCellSize,
      mapFitMode: 'fit_grid',
      mapScaleX: 100,
      mapScaleY: 100,
      mapOffsetX: 0,
      mapOffsetY: 0,
    });

    fitMapAndGridToViewport(nextCols, nextRows, nextCellSize);
    triggerCombatBanner(
      `Scaled map to fit ${nextCols}×${nextRows} tactical grid (${nextCols * (mapConfig.feetPerSquare || 5)}×${
        nextRows * (mapConfig.feetPerSquare || 5)
      } ft)`
    );
  };

  const handleCustomMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const aspect = img.naturalWidth > 0 && img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 28 / 20;
          const cols = mapConfig.gridCols || 28;
          const rows = Math.max(10, Math.min(60, Math.round(cols / aspect)));
          onUpdateMapConfig({
            ...mapConfig,
            backgroundImageUrl: dataUrl,
            backgroundName: file.name.replace(/\.[^/.]+$/, ''),
            imageNaturalWidth: img.naturalWidth,
            imageNaturalHeight: img.naturalHeight,
            gridCols: cols,
            gridRows: rows,
            mapFitMode: 'fit_grid',
            mapScaleX: 100,
            mapScaleY: 100,
            mapOffsetX: 0,
            mapOffsetY: 0,
          });
          fitMapAndGridToViewport(cols, rows, mapConfig.gridSize || 52);
          triggerCombatBanner(`Uploaded "${file.name}" and scaled to fit ${cols}×${rows} grid!`);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Shroud entire map in Fog of War except around player tokens
  const handleShroudUnexploredFog = () => {
    const cols = mapConfig.gridCols || 28;
    const rows = mapConfig.gridRows || 20;
    const playerTokens = tokens.filter(t => t.type === 'player');
    const fogCells: string[] = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const nearPlayer = playerTokens.some(
          pt => Math.hypot(pt.gridX - x, pt.gridY - y) <= 4.5
        );
        if (!nearPlayer) {
          fogCells.push(`${x},${y}`);
        }
      }
    }
    onUpdateMapConfig({
      ...mapConfig,
      fogOfWarEnabled: true,
      fogCells,
    });
    triggerCombatBanner('Fog of War enabled — shrouded areas beyond party vision!');
  };

  // Build Weapon & Monster Attacks for Playing Character or Monster
  const characterOrMonsterActions = useMemo<ActiveTargetingAction[]>(() => {
    if (playingMonsterProfile && playingMonsterProfile.actions.length > 0) {
      return playingMonsterProfile.actions;
    }

    const prof = playingPartyMember ? getProficiencyBonus(playingPartyMember.level) : 2;
    const strMod = getAbilityModifier(playingPartyMember?.abilities?.str ?? 14);
    const dexMod = getAbilityModifier(playingPartyMember?.abilities?.dex ?? 14);

    if (!playingPartyMember?.equipment) {
      return [
        {
          name: 'Melee Strike',
          actionCost: 'Action',
          rangeFeet: 5,
          aoeShape: 'circle',
          aoeSizeFeet: 5,
          damage: '1d8+3',
          damageType: 'Slashing',
          attackBonus: prof + Math.max(strMod, dexMod),
          desc: 'Standard melee weapon attack.',
        },
      ];
    }

    const attacks: ActiveTargetingAction[] = [];
    for (const item of playingPartyMember.equipment) {
      const desc = item.desc || '';
      const dmgMatch = desc.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*([a-zA-Z]+)?/);
      if (dmgMatch && !desc.toLowerCase().includes('heals')) {
        const isRanged =
          desc.toLowerCase().includes('range') ||
          desc.toLowerCase().includes('thrown') ||
          item.name.toLowerCase().includes('bow');
        const isFinesse = desc.toLowerCase().includes('finesse');
        const atkBonus = prof + (isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod);

        attacks.push({
          name: item.name,
          actionCost: 'Action',
          rangeFeet: isRanged ? 60 : 5,
          aoeShape: 'circle',
          aoeSizeFeet: 5,
          damage: dmgMatch[1].replace(/\s+/g, ''),
          damageType: dmgMatch[2] || 'Physical',
          attackBonus: atkBonus,
          desc: item.desc,
        });
      }
    }

    if (attacks.length === 0) {
      attacks.push({
        name: 'Unarmed / Staff Strike',
        actionCost: 'Action',
        rangeFeet: 5,
        aoeShape: 'circle',
        aoeSizeFeet: 5,
        damage: '1d6+2',
        damageType: 'Bludgeoning',
        attackBonus: prof + Math.max(strMod, dexMod),
        desc: 'Melee weapon or unarmed strike.',
      });
    }
    return attacks;
  }, [playingPartyMember, playingMonsterProfile]);

  // Spells count & Items count & Features count for HUD tab badges
  const spellsCount = playingPartyMember?.spells?.length || playingMonsterProfile?.spells?.length || 0;
  const itemsCount = playingPartyMember?.equipment?.length || playingMonsterProfile?.items?.length || 0;
  const featuresCount = playingPartyMember?.features?.length || playingMonsterProfile?.features?.length || 0;

  // Save / Load Complete Encounters (Map Image, Grid Alignment, Walls, Doors, Terrain, NPCs, Items)
  const handleSaveCurrentEncounter = (overwriteId?: string) => {
    const title = (newEncounterName || mapConfig.backgroundName || 'Custom Encounter').trim();
    const encounterObj: SavedEncounter = {
      id: overwriteId || `enc_${Date.now()}`,
      name: title,
      description:
        newEncounterDesc.trim() ||
        `${tokens.length} tokens • ${Object.keys(mapConfig.architectureCells || {}).length} walls/doors • ${
          (mapConfig.lootItems || []).length
        } items`,
      updatedAt: new Date().toISOString(),
      mapConfig: JSON.parse(JSON.stringify(mapConfig)),
      tokens: JSON.parse(JSON.stringify(tokens)),
      combatants: JSON.parse(JSON.stringify(combatants)),
      lootItems: JSON.parse(JSON.stringify(mapConfig.lootItems || [])),
      round,
      turnIndex,
    };

    const nextList = overwriteId
      ? savedEncounters.map(e => (e.id === overwriteId ? encounterObj : e))
      : [encounterObj, ...savedEncounters];

    onUpdateSavedEncounters?.(nextList);
    setNewEncounterName('');
    setNewEncounterDesc('');
    appendCombatLog({
      round,
      category: 'utility',
      title: `Saved Encounter: "${encounterObj.name}"`,
      detail: `Saved map image, grid alignment, ${Object.keys(mapConfig.architectureCells || {}).length} walls/doors, ${
        Object.keys(mapConfig.terrainCells || {}).length
      } terrain cells, ${tokens.length} combatants, and ${(mapConfig.lootItems || []).length} items.`,
      outcome: 'info',
    });
    triggerCombatBanner(`Saved complete encounter "${encounterObj.name}"!`);
  };

  const handleLoadSavedEncounter = (enc: SavedEncounter) => {
    const clonedConfig: MapConfig = JSON.parse(JSON.stringify(enc.mapConfig));
    if (enc.lootItems && !clonedConfig.lootItems) {
      clonedConfig.lootItems = JSON.parse(JSON.stringify(enc.lootItems));
    }
    const clonedTokens: Token[] = JSON.parse(JSON.stringify(enc.tokens));
    const clonedCombatants: Combatant[] = JSON.parse(JSON.stringify(enc.combatants));

    onUpdateMapConfig(clonedConfig);
    onUpdateTokens(clonedTokens);
    onUpdateCombatants(clonedCombatants);
    onUpdateRound(enc.round || 1);
    onUpdateTurnIndex(enc.turnIndex || 0);
    if (clonedTokens[0]) {
      setPlayingTokenId(clonedTokens[0].id);
      setInspectedTokenId(clonedTokens[0].id);
    }
    appendCombatLog({
      round: enc.round || 1,
      category: 'turn',
      title: `Loaded Encounter: "${enc.name}"`,
      detail: `${clonedTokens.length} tokens, ${Object.keys(clonedConfig.architectureCells || {}).length} walls/doors, ${
        (clonedConfig.lootItems || []).length
      } loot items restored.`,
      outcome: 'info',
    });
    triggerCombatBanner(`Loaded encounter "${enc.name}"!`);
  };

  const handleAddEncounterLootItem = (nameOverride?: string, descOverride?: string) => {
    const itemName = (nameOverride ?? newLootItemName).trim();
    if (!itemName) return;
    const matchedEntry = library.find(
      e =>
        (e.category === 'equipment' || e.category === 'magic_items' || e.category === 'items') &&
        e.name.toLowerCase() === itemName.toLowerCase()
    );
    const nextLoot: EncounterLootItem = {
      id: `loot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: matchedEntry ? matchedEntry.name : itemName,
      quantity: Math.max(1, newLootItemQty),
      category: matchedEntry?.category || 'equipment',
      desc: descOverride || matchedEntry?.summary || matchedEntry?.content?.slice(0, 140) || 'Encounter treasure item.',
    };
    const currentLoot = mapConfig.lootItems || [];
    onUpdateMapConfig({
      ...mapConfig,
      lootItems: [...currentLoot, nextLoot],
    });
    setNewLootItemName('');
    setNewLootItemQty(1);
    triggerCombatBanner(`Added "${nextLoot.name} (x${nextLoot.quantity})" to Encounter Loot!`);
  };

  const handleGrantLootToPlayingCharacter = (loot: EncounterLootItem) => {
    const targetMember = playingPartyMember || party[0];
    if (!targetMember || !onUpdateParty) {
      triggerCombatBanner('Select a party hero to claim this loot item!');
      return;
    }
    const updatedParty = party.map(p => {
      if (p.id !== targetMember.id) return p;
      const equip = p.equipment || [];
      const existingIdx = equip.findIndex(i => i.name.toLowerCase() === loot.name.toLowerCase());
      if (existingIdx >= 0) {
        const nextEquip = [...equip];
        nextEquip[existingIdx] = {
          ...nextEquip[existingIdx],
          quantity: nextEquip[existingIdx].quantity + loot.quantity,
        };
        return { ...p, equipment: nextEquip };
      }
      return {
        ...p,
        equipment: [...equip, { name: loot.name, quantity: loot.quantity, desc: loot.desc }],
      };
    });
    onUpdateParty(updatedParty);
    onUpdateMapConfig({
      ...mapConfig,
      lootItems: (mapConfig.lootItems || []).filter(i => i.id !== loot.id),
    });
    triggerCombatBanner(`${targetMember.name} claimed ${loot.name} (x${loot.quantity}) from the encounter!`);
  };

  return (
    <div
      className={
        isMaximized
          ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden flex flex-col'
          : 'relative w-full h-[calc(100vh-5.25rem)] min-h-[660px] rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-950 shadow-2xl flex flex-col'
      }
    >
      {/* ====================================================================
          CENTER STAGE: FULL-VIEWPORT BATTLE MAP CANVAS
      ==================================================================== */}
      <div ref={mapStageWrapperRef} className="relative flex-1 w-full h-full overflow-hidden">
        <BattleMapGrid
          tokens={tokens}
          mapConfig={mapConfig}
          onUpdateTokens={onUpdateTokens}
          onUpdateMapConfig={onUpdateMapConfig}
          playingTokenId={playingTokenId}
          inspectedTokenId={inspectedTokenId}
          onSelectInspectedToken={id => {
            setInspectedTokenId(id);
            if (id) setIsRightHudCollapsed(false);
          }}
          movementRemaining={playingMoveRemaining}
          totalSpeed={playingTotalSpeed}
          isCurrentlyDashing={playingIsDashing}
          onSpendMovement={handleSpendMovement}
          activeLayer={activeLayer}
          activeTool={activeTool}
          activeBrush={activeBrush}
          targetingAction={targetingAction}
          onExecuteTargetedAction={handleExecuteTargetedAction}
          onCancelTargeting={() => {
            setActiveTool('move');
            setTargetingAction(null);
          }}
          onToggleDoor={(gx, gy, nextState) => {
            const opened = nextState === 'door_open';
            appendCombatLog({
              round,
              category: 'utility',
              title: `${playingToken?.name || 'Party'} ${opened ? 'opened' : 'closed'} the door at (${gx}, ${gy})`,
              detail: opened
                ? 'Doorway is now open — vision (Line-of-Sight) and movement are no longer obstructed!'
                : 'Doorway is now closed — blocks Line-of-Sight and movement.',
              outcome: 'info',
            });
            triggerCombatBanner(
              opened
                ? `Door opened at (${gx}, ${gy}) — sight & movement unobstructed!`
                : `Door closed at (${gx}, ${gy}) — blocks sight & movement!`
            );
          }}
          onBlockedMovement={reason => {
            triggerCombatBanner(reason);
          }}
          zoom={zoom}
          onChangeZoom={setZoom}
          pan={pan}
          onChangePan={setPan}
          activeTurnTokenId={activeTurnTokenId}
        />

        {/* Active Layer Mode Floating Helper Pill (when in Background or Architecture Layer) */}
        {activeLayer !== 'tokens' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-amber-500/80 rounded-xl px-4 py-1.5 shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md">
            <Layers className="w-4 h-4 text-amber-400" />
            {activeLayer === 'background' ? (
              <span className="text-slate-200">
                <strong className="text-amber-300">Background & Grid Layer:</strong> Drag canvas to move map image •{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300">Shift + Drag</kbd> to move grid lines • Scroll to scale image
              </span>
            ) : (
              <span className="text-slate-200">
                <strong className="text-amber-300">Walls, Doors & Terrain Layer (Revealed):</strong> Click or drag cells to paint{' '}
                <strong className="text-emerald-300">{activeBrush === 'none' ? 'Select a Brush' : activeBrush}</strong>
              </span>
            )}
            <button
              onClick={() => {
                setActiveLayer('tokens');
                setActiveTool('move');
                setActiveBrush('none');
              }}
              className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
            >
              Done (Return to Play)
            </button>
          </div>
        )}

        {/* ==================================================================
             ACTIVE TARGETING / COMBAT LOG FLOATING BANNER
        ================================================================== */}
        {activeTool === 'target' && targetingAction && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-amber-500/80 rounded-xl px-4 py-2 shadow-2xl flex items-center gap-3 text-xs backdrop-blur-md">
            <Crosshair className="w-4 h-4 text-amber-400 animate-spin" />
            <div>
              <span className="font-bold text-amber-300">{targetingAction.name}</span>
              <span className="text-slate-300 ml-2">
                Click a target on the map to execute ({targetingAction.rangeFeet} ft{' '}
                {targetingAction.aoeShape && targetingAction.aoeShape !== 'circle'
                  ? `• ${targetingAction.aoeSizeFeet}-ft ${targetingAction.aoeShape}`
                  : 'range'}
                {targetingAction.saveType
                  ? ` • ${targetingAction.saveType}`
                  : targetingAction.attackBonus !== undefined
                  ? ` • +${targetingAction.attackBonus} vs AC`
                  : ''}
                )
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTool('move');
                setTargetingAction(null);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
            >
              Cancel
            </button>
          </div>
        )}

        {combatLogBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-emerald-500/60 text-emerald-300 px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur-md pointer-events-none max-w-[90vw] truncate">
            {combatLogBanner}
          </div>
        )}

        {/* ==================================================================
            TOP-LEFT: LAYER SWITCHER, ENCOUNTER SAVER, SPAWNER & MAP CONTROLS
        ================================================================== */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl p-1.5 shadow-xl">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Exit Fullscreen Map (Esc)' : 'Maximize Map to Fullscreen'}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isMaximized ? 'Exit' : 'Maximize'}</span>
            </button>

            {/* 3-Layer Segmented Switcher: Play/Tokens | Background/Grid | Walls/Doors/Terrain */}
            <div className="flex items-center bg-slate-900/95 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  setActiveLayer('tokens');
                  setActiveTool('move');
                  setActiveBrush('none');
                  setShowMapSettingsMenu(false);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  activeLayer === 'tokens'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Layer 1: Tokens & Combat Play Mode (Walls & Terrain hidden, Doors clickable)"
              >
                <Swords className="w-3 h-3" />
                <span>Play</span>
              </button>

              <button
                onClick={() => {
                  setActiveLayer('background');
                  setActiveTool('move');
                  setActiveBrush('none');
                  setShowMapSettingsMenu(true);
                  setShowLeftSpawnerMenu(false);
                  setShowSavedEncountersMenu(false);
                  setShowCombatLogDrawer(false);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  activeLayer === 'background'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Layer 2: Background Image & Grid Alignment Layer (Drag or scale map & grid to line up)"
              >
                <Grid className="w-3 h-3" />
                <span>Map & Grid</span>
              </button>

              <button
                onClick={() => {
                  setActiveLayer('architecture');
                  setActiveTool('brush');
                  if (activeBrush === 'none') setActiveBrush('wall');
                  setShowMapSettingsMenu(true);
                  setShowLeftSpawnerMenu(false);
                  setShowSavedEncountersMenu(false);
                  setShowCombatLogDrawer(false);
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  activeLayer === 'architecture'
                    ? 'bg-rose-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Layer 3: Normally-Invisible Walls, Doors, Terrain & Fog Layer"
              >
                <Layers className="w-3 h-3" />
                <span>Walls & Terrain</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowLeftSpawnerMenu(!showLeftSpawnerMenu);
                setShowMapSettingsMenu(false);
                setShowSavedEncountersMenu(false);
                setShowCombatLogDrawer(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showLeftSpawnerMenu
                  ? 'bg-slate-800 text-amber-300'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Spawn Party or Monsters"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Spawn</span>
            </button>

            <button
              onClick={() => {
                setShowSavedEncountersMenu(!showSavedEncountersMenu);
                setShowLeftSpawnerMenu(false);
                setShowMapSettingsMenu(false);
                setShowCombatLogDrawer(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showSavedEncountersMenu
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Design, Save & Load Complete Encounters (Map, Walls, Doors, Terrain, NPCs, Items)"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Encounters</span>
              <span className="px-1 rounded text-[10px] font-mono-numbers bg-slate-800 text-amber-300">
                {savedEncounters.length}
              </span>
            </button>

            <button
              onClick={() => {
                setShowCombatLogDrawer(!showCombatLogDrawer);
                setShowLeftSpawnerMenu(false);
                setShowMapSettingsMenu(false);
                setShowSavedEncountersMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showCombatLogDrawer
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Open Combat Log & Dice Tray"
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Log</span>
              <span className="px-1 rounded text-[10px] font-mono-numbers bg-slate-800 text-amber-300">
                {combatLogEntries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTool(activeTool === 'ruler' ? 'move' : 'ruler')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                activeTool === 'ruler'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
              title="5ft Distance Ruler"
            >
              <Ruler className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTool(activeTool === 'pan' ? 'move' : 'pan')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                activeTool === 'pan'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
              title="Pan Canvas"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-0.5 pl-1 border-l border-slate-800">
              <button
                onClick={() => setZoom(z => Math.max(0.45, z - 0.15))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-1 text-[10px] font-mono-numbers text-slate-400 hover:text-amber-400"
                title="Reset Camera"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom(z => Math.min(2.6, z + 0.15))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleScaleMapToFitGrid()}
                className="ml-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/60 text-[10px] font-semibold text-amber-300 flex items-center gap-1 transition-colors"
                title="Scale Map to Fit Grid & Frame Viewport"
              >
                <Grid className="w-3 h-3 text-amber-400" />
                <span className="hidden lg:inline">Fit to Grid</span>
              </button>
            </div>
          </div>

          {/* Collapsible Quick Spawner Drawer */}
          {showLeftSpawnerMenu && (
            <div className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-xl rounded-xl p-3 shadow-2xl w-80 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-amber-400 font-fantasy">Spawn Combatants</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowLeftSpawnerMenu(false);
                      setShowCharacterBuilderModal(true);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Build Hero</span>
                  </button>
                  <button onClick={() => setShowLeftSpawnerMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Party Members</span>
                <div className="flex flex-wrap gap-1.5">
                  {party.map(p => (
                    <button
                      key={p.id}
                      onClick={() => spawnPartyToken(p)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>+ {p.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  SRD Monsters (Click to Spawn & Play)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {library
                    .filter(e => e.category === 'monsters')
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => spawnMonsterToken(m)}
                        className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 text-red-200 flex items-center gap-1"
                      >
                        <span>+ {m.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              DRAWER: SAVED ENCOUNTERS & LOOT CACHE DESIGNER
              Saves & loads Background Image, Grid Alignment, Walls, Doors, Terrain, NPCs, and Items!
          ================================================================== */}
          {showSavedEncountersMenu && (
            <div className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-xl rounded-xl p-3.5 shadow-2xl w-88 text-xs space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-amber-400 font-fantasy flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Encounter Designer & Saved Scenarios</span>
                </span>
                <button onClick={() => setShowSavedEncountersMenu(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Save Current Encounter Snapshot */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                    Save Current Encounter
                  </span>
                  <span className="text-[10px] font-mono-numbers text-slate-400">
                    {tokens.length} NPCs • {Object.keys(mapConfig.architectureCells || {}).length} Walls/Doors
                  </span>
                </div>
                <input
                  type="text"
                  value={newEncounterName}
                  onChange={e => setNewEncounterName(e.target.value)}
                  placeholder={`Name (e.g., ${mapConfig.backgroundName || 'Goblin Stronghold'})`}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={newEncounterDesc}
                  onChange={e => setNewEncounterDesc(e.target.value)}
                  placeholder="Optional notes (e.g. Ambush behind closed door)"
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-500 text-[11px] focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveCurrentEncounter()}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Complete Encounter</span>
                </button>
              </div>

              {/* 2. Encounter Loot & Items Cache (Saved with the Encounter) */}
              <div className="border-t border-slate-800/80 pt-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                    <Backpack className="w-3 h-3 text-amber-400" /> Encounter Items & Loot Cache
                  </span>
                  <span className="text-[10px] font-mono-numbers text-amber-400">
                    {(mapConfig.lootItems || []).length} items
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newLootItemName}
                    onChange={e => setNewLootItemName(e.target.value)}
                    placeholder="Add SRD or custom item (e.g. Potion of Healing)"
                    className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newLootItemQty}
                    onChange={e => setNewLootItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-11 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono-numbers text-[11px] text-amber-300"
                  />
                  <button
                    onClick={() => handleAddEncounterLootItem()}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px]"
                  >
                    + Add
                  </button>
                </div>

                {(mapConfig.lootItems || []).length > 0 ? (
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {(mapConfig.lootItems || []).map(loot => (
                      <div
                        key={loot.id}
                        className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200 truncate">{loot.name}</span>
                          <span className="text-[10px] font-mono-numbers text-amber-400 ml-1.5">x{loot.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleGrantLootToPlayingCharacter(loot)}
                            title="Claim / Grant to Playing Character"
                            className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold"
                          >
                            Claim
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                lootItems: (mapConfig.lootItems || []).filter(i => i.id !== loot.id),
                              })
                            }
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    No items in this encounter yet — add treasure or equipment above.
                  </div>
                )}
              </div>

              {/* 3. Saved Encounters Library */}
              <div className="border-t border-slate-800/80 pt-2.5 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Saved Encounters ({savedEncounters.length})
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedEncounters.map(enc => {
                    const wallCount = Object.values(enc.mapConfig.architectureCells || {}).filter(
                      v => v === 'wall'
                    ).length;
                    const doorCount = Object.values(enc.mapConfig.architectureCells || {}).filter(
                      v => v === 'door_closed' || v === 'door_open'
                    ).length;
                    const terrainCount = Object.keys(enc.mapConfig.terrainCells || {}).length;
                    const itemCount = (enc.lootItems || enc.mapConfig.lootItems || []).length;

                    return (
                      <div
                        key={enc.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 text-xs truncate">{enc.name}</div>
                            {enc.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-2">{enc.description}</div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              onUpdateSavedEncounters?.(savedEncounters.filter(s => s.id !== enc.id))
                            }
                            title="Delete Saved Encounter"
                            className="text-slate-500 hover:text-red-400 p-0.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1 text-[9px] font-mono-numbers text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">
                            {enc.tokens.length} Tokens
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300">
                            {wallCount} Walls • {doorCount} Doors
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">
                            {terrainCount} Terrain
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                            {itemCount} Items
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => handleLoadSavedEncounter(enc)}
                            className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>Load Encounter</span>
                          </button>
                          <button
                            onClick={() => handleSaveCurrentEncounter(enc.id)}
                            title="Overwrite this saved encounter with current map state"
                            className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                          >
                            Overwrite
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              DRAWER: LAYER INSPECTOR (BACKGROUND & GRID ALIGNMENT vs WALLS, DOORS & TERRAIN)
          ================================================================== */}
          {showMapSettingsMenu && (
            <div className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-xl rounded-xl p-3.5 shadow-2xl w-84 text-xs space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-amber-400 font-fantasy">
                  {activeLayer === 'architecture'
                    ? 'Layer 3: Walls, Doors, Terrain & Fog'
                    : 'Layer 2: Map Image & Grid Alignment'}
                </span>
                <button
                  onClick={() => {
                    setShowMapSettingsMenu(false);
                    if (activeLayer !== 'tokens') {
                      setActiveLayer('tokens');
                      setActiveTool('move');
                      setActiveBrush('none');
                    }
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Layer Switcher Tabs inside Drawer */}
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    setActiveLayer('background');
                    setActiveTool('move');
                    setActiveBrush('none');
                  }}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 ${
                    activeLayer === 'background'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>Background & Grid</span>
                </button>
                <button
                  onClick={() => {
                    setActiveLayer('architecture');
                    setActiveTool('brush');
                    if (activeBrush === 'none') setActiveBrush('wall');
                  }}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 ${
                    activeLayer === 'architecture'
                      ? 'bg-rose-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Walls, Doors & Terrain</span>
                </button>
              </div>

              {/* ==============================================================
                  TAB A: WALLS, DOORS, TERRAIN & FOG LAYER (Normally Invisible Layer)
              ============================================================== */}
              {activeLayer === 'architecture' ? (
                <div className="space-y-3">
                  <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-2 text-[11px] text-rose-200">
                    This architect layer is <strong>normally invisible</strong> during Play mode. Walls & Closed Doors automatically obstruct movement and cast Line-of-Sight Fog of War. Clicking a Closed Door in Play mode opens it!
                  </div>

                  {/* 1. Walls & Openable Doors Brushes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                        Walls & Openable Doors
                      </span>
                      {Object.keys(mapConfig.architectureCells || {}).length > 0 && (
                        <button
                          onClick={() => onUpdateMapConfig({ ...mapConfig, architectureCells: {} })}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Clear Walls/Doors
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        {
                          id: 'wall',
                          label: 'Wall / Block (LOS + Move)',
                          color: 'text-rose-300 border-rose-800/70',
                        },
                        {
                          id: 'door_closed',
                          label: 'Closed Door (Blocks)',
                          color: 'text-amber-300 border-amber-700/70',
                        },
                        {
                          id: 'door_open',
                          label: 'Open Door (Passable)',
                          color: 'text-emerald-300 border-emerald-700/70',
                        },
                        {
                          id: 'erase_terrain',
                          label: 'Eraser (Wall/Door/Terrain)',
                          color: 'text-slate-300 border-slate-700',
                        },
                      ].map(b => {
                        const active = activeBrush === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setActiveTool('brush');
                              setActiveBrush(b.id as MapBrushMode);
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                              active
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                                : `bg-slate-900 ${b.color} hover:bg-slate-800`
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Tactical Terrain & Cover Brushes (Moved into this Layer!) */}
                  <div className="border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                        Terrain & Cover Brushes
                      </span>
                      {Object.keys(mapConfig.terrainCells || {}).length > 0 && (
                        <button
                          onClick={() => onUpdateMapConfig({ ...mapConfig, terrainCells: {} })}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Clear Terrain
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'difficult', label: 'Difficult (2x)', color: 'text-amber-300' },
                        { id: 'cover', label: 'Cover (+2 AC)', color: 'text-sky-300' },
                        { id: 'hazard', label: 'Hazard / Lava', color: 'text-red-300' },
                      ].map(b => {
                        const active = activeBrush === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setActiveTool('brush');
                              setActiveBrush(b.id as MapBrushMode);
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                              active
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                : `bg-slate-900 border-slate-800 ${b.color} hover:bg-slate-800`
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Dynamic Line-of-Sight & Fog of War Controls */}
                  <div className="border-t border-slate-800/80 pt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-purple-400" /> Vision & Fog of War
                      </span>
                      <button
                        onClick={() =>
                          onUpdateMapConfig({
                            ...mapConfig,
                            fogOfWarEnabled: !mapConfig.fogOfWarEnabled,
                            dynamicLosEnabled: !mapConfig.fogOfWarEnabled,
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          mapConfig.fogOfWarEnabled
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {mapConfig.fogOfWarEnabled ? 'LOS Fog: ON' : 'LOS Fog: OFF'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={handleShroudUnexploredFog}
                        className="px-2 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 text-purple-200 font-semibold text-[11px] flex items-center justify-center gap-1"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Shroud Unexplored</span>
                      </button>
                      <button
                        onClick={() =>
                          onUpdateMapConfig({
                            ...mapConfig,
                            fogOfWarEnabled: false,
                            dynamicLosEnabled: false,
                            fogCells: [],
                          })
                        }
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Reveal All</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTool('brush');
                          setActiveBrush('fog_reveal');
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium ${
                          activeBrush === 'fog_reveal'
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-emerald-300'
                        }`}
                      >
                        Brush: Reveal Fog
                      </button>
                      <button
                        onClick={() => {
                          setActiveTool('brush');
                          setActiveBrush('fog_shroud');
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium ${
                          activeBrush === 'fog_shroud'
                            ? 'bg-purple-500 text-slate-950 font-bold border-purple-400'
                            : 'bg-slate-900 border-slate-800 text-purple-300'
                        }`}
                      >
                        Brush: Paint Fog
                      </button>
                    </div>

                    <label className="flex items-center justify-between pt-1 text-[11px] text-slate-300 cursor-pointer">
                      <span>Show Walls & Terrain badges during Play mode</span>
                      <input
                        type="checkbox"
                        checked={Boolean(mapConfig.showTerrainInPlayMode)}
                        onChange={e =>
                          onUpdateMapConfig({
                            ...mapConfig,
                            showTerrainInPlayMode: e.target.checked,
                          })
                        }
                        className="accent-amber-500 rounded"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                /* ==============================================================
                   TAB B: BACKGROUND IMAGE & GRID ALIGNMENT LAYER
                   Move or scale the background image OR move the grid lines so pre-existing grids line up!
                ============================================================== */
                <div className="space-y-3">
                  <div className="bg-amber-950/30 border border-amber-700/40 rounded-lg p-2 text-[11px] text-amber-200">
                    <strong>Tip:</strong> In this layer, drag directly on the canvas to move the background image,{' '}
                    <kbd className="px-1 rounded bg-slate-900 text-amber-300">Shift + Drag</kbd> to shift the grid lines, or scroll to scale the image!
                  </div>

                  {/* 1. Scale Map to Fit Grid & Match Aspect */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Map-to-Grid Scaling & Alignment
                      </span>
                      <span className="text-[10px] font-mono-numbers text-amber-400">
                        {mapConfig.gridCols || 28}×{mapConfig.gridRows || 20} sq ({mapConfig.gridSize || 52}px)
                      </span>
                    </div>

                    <button
                      onClick={() => handleScaleMapToFitGrid()}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Scale Map to Fit Grid (1:1)</span>
                    </button>

                    {mapConfig.imageNaturalWidth && mapConfig.imageNaturalHeight && (
                      <button
                        onClick={() => handleScaleMapToFitGrid({ matchAspectToImage: true })}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Grid className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          Match Grid to Image Aspect ({mapConfig.imageNaturalWidth}×{mapConfig.imageNaturalHeight}px)
                        </span>
                      </button>
                    )}
                  </div>

                  {/* 2. Move Background Map Image (X / Y Offset) & Scale % */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                        Move & Scale Background Image
                      </span>
                      <button
                        onClick={() =>
                          onUpdateMapConfig({
                            ...mapConfig,
                            mapOffsetX: 0,
                            mapOffsetY: 0,
                            mapScaleX: 100,
                            mapScaleY: 100,
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                      >
                        Reset Image
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Image X Offset ({mapConfig.mapOffsetX || 0}px)
                        </span>
                        <div className="flex items-center gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetX: (mapConfig.mapOffsetX || 0) - 5 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -5
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetX: (mapConfig.mapOffsetX || 0) - 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetX: (mapConfig.mapOffsetX || 0) + 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetX: (mapConfig.mapOffsetX || 0) + 5 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Image Y Offset ({mapConfig.mapOffsetY || 0}px)
                        </span>
                        <div className="flex items-center gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetY: (mapConfig.mapOffsetY || 0) - 5 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -5
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetY: (mapConfig.mapOffsetY || 0) - 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetY: (mapConfig.mapOffsetY || 0) + 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, mapOffsetY: (mapConfig.mapOffsetY || 0) + 5 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-300">Image Scale (%)</span>
                        <span className="font-mono-numbers text-amber-400">{mapConfig.mapScaleX ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="1"
                        value={mapConfig.mapScaleX ?? 100}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10) || 100;
                          onUpdateMapConfig({ ...mapConfig, mapScaleX: val, mapScaleY: val });
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 3. Move & Resize Tactical Grid (Align Grid to Pre-Drawn Map Grid) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-sky-300">
                        Align Grid Lines to Image Grid
                      </span>
                      <button
                        onClick={() =>
                          onUpdateMapConfig({
                            ...mapConfig,
                            gridOffsetX: 0,
                            gridOffsetY: 0,
                            gridSize: 52,
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-sky-300 underline"
                      >
                        Reset Grid
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Grid X Shift ({mapConfig.gridOffsetX || 0}px)
                        </span>
                        <div className="flex items-center gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetX: (mapConfig.gridOffsetX || 0) - 4 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -4
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetX: (mapConfig.gridOffsetX || 0) - 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetX: (mapConfig.gridOffsetX || 0) + 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetX: (mapConfig.gridOffsetX || 0) + 4 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +4
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Grid Y Shift ({mapConfig.gridOffsetY || 0}px)
                        </span>
                        <div className="flex items-center gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetY: (mapConfig.gridOffsetY || 0) - 4 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -4
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetY: (mapConfig.gridOffsetY || 0) - 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetY: (mapConfig.gridOffsetY || 0) + 1 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +1
                          </button>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({ ...mapConfig, gridOffsetY: (mapConfig.gridOffsetY || 0) + 4 })
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +4
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grid Cell Size (px per square) & Columns x Rows */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-300">Grid Cell Size (px)</span>
                        <span className="font-mono-numbers text-sky-400">{mapConfig.gridSize || 52}px</span>
                      </div>
                      <input
                        type="range"
                        min="28"
                        max="96"
                        step="1"
                        value={mapConfig.gridSize || 52}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10) || 52;
                          onUpdateMapConfig({ ...mapConfig, gridSize: val });
                        }}
                        className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Columns (Width)</span>
                        <div className="flex items-center justify-between gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                gridCols: Math.max(8, (mapConfig.gridCols || 28) - 1),
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-100">{mapConfig.gridCols || 28}</span>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                gridCols: Math.min(60, (mapConfig.gridCols || 28) + 1),
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Rows (Height)</span>
                        <div className="flex items-center justify-between gap-1 font-mono-numbers">
                          <button
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                gridRows: Math.max(8, (mapConfig.gridRows || 20) - 1),
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-100">{mapConfig.gridRows || 20}</span>
                          <button
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                gridRows: Math.min(60, (mapConfig.gridRows || 20) + 1),
                              })
                            }
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Battleground Presets & Custom Upload */}
                  <div className="border-t border-slate-800/80 pt-2.5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                      Battleground Presets & Custom Image
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BATTLEGROUND_PRESETS.map(preset => {
                        const isSelected = (mapConfig.backgroundImageUrl || 'dungeon_crypt') === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() =>
                              onUpdateMapConfig({
                                ...mapConfig,
                                backgroundImageUrl: preset.id,
                                backgroundName: preset.name,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-left transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="text-[11px] truncate">{preset.name}</div>
                            <div className="text-[9px] text-slate-400 truncate">{preset.subtitle}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300">Grid Line Opacity</span>
                        <span className="font-mono-numbers text-amber-400">
                          {Math.round((mapConfig.gridOpacity ?? 0.35) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={Math.round((mapConfig.gridOpacity ?? 0.35) * 100)}
                        onChange={e => {
                          const val = parseFloat(e.target.value) / 100;
                          onUpdateMapConfig({ ...mapConfig, gridOpacity: val, showGrid: val > 0 });
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer flex items-center justify-center gap-1.5 font-medium">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Custom Battlemap</span>
                        <input type="file" accept="image/*" onChange={handleCustomMapUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Combat Log & Dice Roller Drawer */}
          <CombatLogDrawer
            isOpen={showCombatLogDrawer}
            onClose={() => setShowCombatLogDrawer(false)}
            entries={combatLogEntries}
            onClearEntries={() => setCombatLogEntries([])}
            onAddLogEntry={appendCombatLog}
            round={round}
            rollMode={rollMode}
            onChangeRollMode={setRollMode}
          />
        </div>

        {/* ==================================================================
            TOP CENTER: BALDUR'S GATE 3 TURN & INITIATIVE TRACKER RIBBON
            Shows whose turn it is, who is next, and collapses to minimal mode
        ================================================================== */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-[92vw]">
          {isTopHudCollapsed ? (
            <div className="bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-xl flex items-center gap-3 text-xs">
              <span className="font-fantasy font-bold text-amber-400">Round {round}</span>
              {activeTurnCombatant && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeTurnCombatant.color || '#10b981' }}
                    />
                    Turn: {activeTurnCombatant.name}
                  </span>
                </>
              )}
              {nextTurnCombatant && (
                <>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-400">Next: {nextTurnCombatant.name.split(' ')[0]}</span>
                </>
              )}
              <button
                onClick={() => handleAdvanceTurn(1)}
                className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
              >
                Next Turn
              </button>
              <button
                onClick={() => setIsTopHudCollapsed(false)}
                className="p-1 text-slate-400 hover:text-white"
                title="Expand Initiative Ribbon"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-950/90 border border-slate-800/90 backdrop-blur-xl rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-2.5">
              {/* Round & Prev Turn */}
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800 shrink-0">
                <button
                  onClick={() => handleAdvanceTurn(-1)}
                  title="Previous Turn"
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="text-center px-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Round</div>
                  <div className="text-sm font-bold font-fantasy text-amber-400 font-mono-numbers leading-none">
                    {round}
                  </div>
                </div>
                <button
                  onClick={() => handleAdvanceTurn(1)}
                  title="Next Turn"
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ordered Initiative Portrait Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[46vw]">
                {sortedCombatants.map((comb, idx) => {
                  const isCurrentTurn = idx === turnIndex % sortedCombatants.length;
                  const isNextTurn =
                    sortedCombatants.length > 1 && idx === (turnIndex + 1) % sortedCombatants.length;
                  const matchTok =
                    tokens.find(t => t.id === comb.tokenId) ||
                    tokens.find(t => t.name.toLowerCase() === comb.name.toLowerCase());
                  const hpPct = Math.max(0, Math.min(100, Math.round((comb.hp / Math.max(1, comb.maxHp)) * 100)));

                  return (
                    <button
                      key={comb.id}
                      onClick={() => {
                        if (matchTok) {
                          setInspectedTokenId(matchTok.id);
                          setIsRightHudCollapsed(false);
                        }
                      }}
                      onDoubleClick={() => {
                        if (matchTok) handleSwitchToCharacter(matchTok.id);
                      }}
                      title={`${comb.name} (Init ${comb.initiative}) — Click to inspect, Double-click to play`}
                      className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 text-left ${
                        isCurrentTurn
                          ? 'bg-amber-500/15 border-amber-400 shadow-lg scale-[1.02]'
                          : isNextTurn
                          ? 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
                          : 'bg-slate-900/60 border-slate-800/80 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Portrait Circle */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-black/50 shrink-0 relative"
                        style={{ backgroundColor: comb.color || (comb.isPlayer ? '#3b82f6' : '#ef4444') }}
                      >
                        {comb.name.slice(0, 2).toUpperCase()}
                        <span className="absolute -bottom-1 -right-1 bg-slate-950 text-[8px] font-mono-numbers px-1 rounded border border-slate-700 text-slate-300">
                          {comb.initiative}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-100 truncate max-w-[78px]">
                            {comb.name.split(' ')[0]}
                          </span>
                          {isCurrentTurn && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                              NOW
                            </span>
                          )}
                          {isNextTurn && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-sky-400">
                              NEXT
                            </span>
                          )}
                        </div>
                        {/* Mini Health Bar */}
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              hpPct > 50 ? 'bg-emerald-500' : hpPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Roll Initiative & Collapse Controls */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-800 shrink-0">
                <button
                  onClick={handleRollAllInitiative}
                  title="Roll Initiative (d20 + DEX) for all tokens on map"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsTopHudCollapsed(true)}
                  title="Collapse Turn Tracker"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================
            RIGHT SIDE: SELECTED CHARACTER INTERACTION MENU WITH "SWITCH TO"
            Shows HP, Movement left, Abilities, Actions preview, and "Switch To"
        ================================================================== */}
        {inspectedToken && (
          <div className="absolute top-16 right-3 z-30">
            {isRightHudCollapsed ? (
              <button
                onClick={() => setIsRightHudCollapsed(false)}
                className="bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 text-xs text-slate-200 hover:border-amber-500/50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: inspectedToken.color || '#3b82f6' }}
                />
                <span className="font-semibold">{inspectedToken.name.split(' ')[0]}</span>
                <span className="text-slate-400 font-mono-numbers">
                  {inspectedToken.hp}/{inspectedToken.maxHp} HP
                </span>
                <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
              </button>
            ) : (
              <div className="w-76 bg-slate-950/92 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl text-xs flex flex-col gap-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white border border-white/20 shrink-0 shadow"
                      style={{ backgroundColor: inspectedToken.color || '#3b82f6' }}
                    >
                      {inspectedToken.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-100 font-fantasy truncate">
                        {inspectedToken.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="capitalize">
                          {inspectedLibraryEntry?.stats?.type || inspectedToken.type}
                        </span>
                        <span>·</span>
                        <span>AC {inspectedToken.ac}</span>
                        {inspectedLibraryEntry?.stats?.cr && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 font-semibold">
                              CR {inspectedLibraryEntry.stats.cr}
                            </span>
                          </>
                        )}
                        {playingTokenId === inspectedToken.id && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400 font-semibold">Playing</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsRightHudCollapsed(true)}
                    title="Minimize Inspector"
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Health Bar & Quick Adjusters */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between font-mono-numbers">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Heart className="w-3 h-3 text-red-400" /> Hit Points
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {inspectedToken.hp} / {inspectedToken.maxHp}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-200 ${
                        inspectedToken.hp / Math.max(1, inspectedToken.maxHp) > 0.5
                          ? 'bg-emerald-500'
                          : inspectedToken.hp / Math.max(1, inspectedToken.maxHp) > 0.2
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (inspectedToken.hp / Math.max(1, inspectedToken.maxHp)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1 font-mono-numbers">
                    {[-5, -1, 1, 5].map(delta => (
                      <button
                        key={delta}
                        onClick={() => syncHpForToken(inspectedToken.id, inspectedToken.hp + delta)}
                        className={`py-1 rounded text-[11px] font-semibold border transition-colors ${
                          delta < 0
                            ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-900/50'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-900/50'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Movement Left & Speed Modes */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between font-mono-numbers">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Footprints className="w-3 h-3 text-emerald-400" /> Movement Left
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {inspectedMoveRemaining} / {inspectedTotalSpeed} ft
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{
                        width: `${Math.min(100, (inspectedMoveRemaining / Math.max(1, inspectedTotalSpeed)) * 100)}%`,
                      }}
                    />
                  </div>
                  {inspectedMonsterProfile && inspectedMonsterProfile.movementModes.length > 1 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {inspectedMonsterProfile.movementModes.map(m => (
                        <button
                          key={m.mode}
                          onClick={() =>
                            setTokenMoveMode(prev => ({ ...prev, [inspectedToken.id]: m.mode }))
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono-numbers border ${
                            activeInspectedMoveMode === m.mode
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m.mode} {m.speed} ft
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ability Scores Strip (Party Member or Monster) */}
                {(inspectedPartyMember?.abilities || inspectedLibraryEntry?.stats?.abilities) && (
                  <div className="grid grid-cols-6 gap-1 bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 text-center font-mono-numbers">
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(statKey => {
                      const val =
                        inspectedPartyMember?.abilities?.[statKey] ??
                        inspectedLibraryEntry?.stats?.abilities?.[statKey] ??
                        10;
                      const mod = Math.floor((val - 10) / 2);
                      return (
                        <div key={statKey} className="bg-slate-950/70 rounded py-1">
                          <div className="text-[9px] uppercase text-slate-500 font-bold">{statKey}</div>
                          <div className="text-[11px] font-bold text-slate-200">{val}</div>
                          <div className="text-[9px] text-amber-400">{mod >= 0 ? `+${mod}` : mod}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Actions & Traits Summary for Inspected Monster */}
                {inspectedMonsterProfile && inspectedMonsterProfile.actions.length > 0 && (
                  <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block">
                      Combat Actions ({inspectedMonsterProfile.actions.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inspectedMonsterProfile.actions.map((act, i) => (
                        <span
                          key={i}
                          title={act.desc}
                          className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-200 font-medium"
                        >
                          {act.name}
                          {act.damage ? ` (${act.damage})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditions Toggles */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Conditions
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['Poisoned', 'Prone', 'Blinded', 'Charmed', 'Frightened', 'Stunned', 'Concentrating'].map(cond => {
                      const active = inspectedToken.conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => {
                            const nextConds = active
                              ? inspectedToken.conditions.filter(c => c !== cond)
                              : [...inspectedToken.conditions, cond];
                            onUpdateTokens(
                              tokens.map(t => (t.id === inspectedToken.id ? { ...t, conditions: nextConds } : t))
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                            active
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Utility Row: Sheet / Library & Token Size / Delete */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/80">
                  {inspectedPartyMember ? (
                    <button
                      onClick={() => onOpenCharacterSheet?.(inspectedPartyMember)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>Character Sheet</span>
                    </button>
                  ) : inspectedLibraryEntry ? (
                    <button
                      onClick={() => onOpenEncyclopediaEntry?.(inspectedLibraryEntry)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>Stat Block</span>
                    </button>
                  ) : null}

                  <div className="flex items-center gap-1">
                    {([1, 2, 3] as TokenSizeType[]).map(sz => (
                      <button
                        key={sz}
                        onClick={() =>
                          onUpdateTokens(tokens.map(t => (t.id === inspectedToken.id ? { ...t, size: sz } : t)))
                        }
                        className={`px-1.5 py-1 rounded text-[10px] font-mono-numbers border ${
                          inspectedToken.size === sz
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sz}x
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const dup: Token = {
                          ...inspectedToken,
                          id: `tok_${Date.now()}`,
                          name: `${inspectedToken.name} 2`,
                          gridX: Math.min(26, inspectedToken.gridX + 1),
                        };
                        onUpdateTokens([...tokens, dup]);
                      }}
                      title="Duplicate Token"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        const next = tokens.filter(t => t.id !== inspectedToken.id);
                        onUpdateTokens(next);
                        setInspectedTokenId(next[0]?.id || null);
                      }}
                      title="Remove Token"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* PROMINENT "SWITCH TO" BUTTON AT BOTTOM OF RIGHT MENU */}
                <button
                  onClick={() => handleSwitchToCharacter(inspectedToken.id)}
                  disabled={playingTokenId === inspectedToken.id}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    playingTokenId === inspectedToken.id
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {playingTokenId === inspectedToken.id
                      ? `Currently Playing ${inspectedToken.name.split(' ')[0]}`
                      : `Switch To ${inspectedToken.name}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================
            BOTTOM CENTER: BALDUR'S GATE 3 ACTIVE CHARACTER / MONSTER HUD DOCK
            Shows current playing character's HP bar, name, movement, actions,
            spell slots/spells, items, features, Roll Mode, Rests, and End Turn
        ================================================================== */}
        {playingToken && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-5xl">
            {isBottomHudCollapsed ? (
              /* Minimal Collapsed Bottom Bar */
              <div className="bg-slate-950/92 border border-slate-800/90 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-2xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] border border-emerald-400"
                    style={{ backgroundColor: playingToken.color || '#3b82f6' }}
                  >
                    {playingToken.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-fantasy font-bold text-slate-100">{playingToken.name}</span>
                  <span className="font-mono-numbers text-emerald-400 font-semibold">
                    {playingToken.hp}/{playingToken.maxHp} HP
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono-numbers text-sky-400">
                    {playingMoveRemaining}/{playingTotalSpeed} ft {activePlayingMoveMode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBottomHudCollapsed(false)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center gap-1"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expand Action Bar</span>
                  </button>
                  <button
                    onClick={() => handleAdvanceTurn(1)}
                    className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    End Turn
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded Baldur's Gate 3 Combat Deck */
              <div className="bg-slate-950/94 border border-slate-800/90 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5">
                {/* Top Strip of Dock: Portrait & Health Bar | Resources & Spell Slots | Roll Mode & Rests | End Turn */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                  {/* Left: Character Portrait, Name & Health Bar */}
                  <div className="flex items-center gap-3 min-w-[210px]">
                    <button
                      onClick={() => {
                        if (playingPartyMember && onOpenCharacterSheet) {
                          onOpenCharacterSheet(playingPartyMember);
                        } else if (playingLibraryEntry && onOpenEncyclopediaEntry) {
                          onOpenEncyclopediaEntry(playingLibraryEntry);
                        }
                      }}
                      title="Open Character Sheet / Stat Block"
                      className="relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-emerald-400 shadow-lg shrink-0 hover:scale-105 transition-transform"
                      style={{ backgroundColor: playingToken.color || '#3b82f6' }}
                    >
                      {playingToken.name.slice(0, 2).toUpperCase()}
                      <span className="absolute -bottom-1 -right-1 bg-slate-950 text-sky-300 border border-sky-500/40 rounded-full px-1 text-[9px] font-mono-numbers font-bold">
                        {playingToken.ac}
                      </span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-fantasy font-bold text-sm text-slate-100 truncate">
                          {playingToken.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {playingPartyMember
                            ? `Lvl ${playingPartyMember.level} ${playingPartyMember.characterClass}`
                            : playingLibraryEntry?.stats?.type
                            ? `${playingLibraryEntry.stats.size || ''} ${playingLibraryEntry.stats.type}${
                                playingLibraryEntry.stats.cr ? ` • CR ${playingLibraryEntry.stats.cr}` : ''
                              }`
                            : playingToken.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Prominent Health Bar */}
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            className={`h-full transition-all duration-200 ${
                              playingToken.hp / Math.max(1, playingToken.maxHp) > 0.5
                                ? 'bg-emerald-500'
                                : playingToken.hp / Math.max(1, playingToken.maxHp) > 0.2
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, (playingToken.hp / Math.max(1, playingToken.maxHp)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono-numbers font-bold text-slate-200 shrink-0">
                          {playingToken.hp}/{playingToken.maxHp} HP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Movement Bar, Action Pips, Roll Mode & Spell Slot Pips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Movement Meter */}
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 font-mono-numbers text-[11px]">
                          <span className="text-slate-400">{activePlayingMoveMode}:</span>
                          <span className="font-bold text-emerald-400">{playingMoveRemaining}</span>
                          <span className="text-slate-500">/ {playingTotalSpeed} ft</span>
                        </div>
                        <div className="w-20 h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-200"
                            style={{
                              width: `${Math.min(
                                100,
                                (playingMoveRemaining / Math.max(1, playingTotalSpeed)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTokenMovementSpent(prev => ({ ...prev, [playingToken.id]: 0 }))
                        }
                        title="Reset Movement for Turn"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Action / Bonus Action / Reaction Pips */}
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px]">
                      <button
                        onClick={() => updatePlayingEconomy({ hasAction: !currentEconomy.hasAction })}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                          currentEconomy.hasAction ? 'text-emerald-300 font-semibold' : 'text-slate-600 line-through'
                        }`}
                        title="Toggle Action Pip"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            currentEconomy.hasAction ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-700'
                          }`}
                        />
                        <span>Action</span>
                      </button>

                      <button
                        onClick={() => updatePlayingEconomy({ hasBonusAction: !currentEconomy.hasBonusAction })}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                          currentEconomy.hasBonusAction
                            ? 'text-amber-300 font-semibold'
                            : 'text-slate-600 line-through'
                        }`}
                        title="Toggle Bonus Action Pip"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            currentEconomy.hasBonusAction
                              ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                              : 'bg-slate-700'
                          }`}
                        />
                        <span>Bonus</span>
                      </button>

                      <button
                        onClick={() => updatePlayingEconomy({ hasReaction: !currentEconomy.hasReaction })}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                          currentEconomy.hasReaction ? 'text-sky-300 font-semibold' : 'text-slate-600 line-through'
                        }`}
                        title="Toggle Reaction Pip"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            currentEconomy.hasReaction ? 'bg-sky-400 shadow-sm shadow-sky-400/50' : 'bg-slate-700'
                          }`}
                        />
                        <span>React</span>
                      </button>
                    </div>

                    {/* Advantage / Normal / Disadvantage Combat Roll Toggle */}
                    <div
                      className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-[10px]"
                      title="D20 Roll Mode for Attacks & Saving Throws"
                    >
                      {(['advantage', 'normal', 'disadvantage'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setRollMode(m)}
                          className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                            rollMode === m
                              ? m === 'advantage'
                                ? 'bg-emerald-500 text-slate-950'
                                : m === 'disadvantage'
                                ? 'bg-red-500 text-white'
                                : 'bg-amber-500 text-slate-950'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m === 'advantage' ? 'ADV' : m === 'disadvantage' ? 'DIS' : 'NORM'}
                        </button>
                      ))}
                    </div>

                    {/* Spell Slots Pips (if Party Spellcaster) */}
                    {playingPartyMember?.spellcasting?.slotsMax && (
                      <div className="flex items-center gap-1 bg-slate-900/90 border border-purple-900/50 rounded-xl px-2 py-1.5 text-[11px] font-mono-numbers">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {playingPartyMember.spellcasting.slotsMax.map((max, lvlIdx) => {
                          const used = playingPartyMember.spellcasting?.slotsUsed?.[lvlIdx] || 0;
                          const rem = Math.max(0, max - used);
                          return (
                            <button
                              key={lvlIdx}
                              onClick={() => {
                                if (!onUpdateParty || !playingPartyMember.spellcasting) return;
                                const nextUsed = [...(playingPartyMember.spellcasting.slotsUsed || [0, 0, 0])];
                                nextUsed[lvlIdx] = used >= max ? 0 : used + 1;
                                onUpdateParty(
                                  party.map(p =>
                                    p.id === playingPartyMember.id && p.spellcasting
                                      ? { ...p, spellcasting: { ...p.spellcasting, slotsUsed: nextUsed } }
                                      : p
                                  )
                                );
                              }}
                              title={`Level ${lvlIdx + 1} Spell Slots (${rem}/${max} available) — Click to cycle`}
                              className={`px-1.5 py-0.5 rounded border transition-colors ${
                                rem > 0
                                  ? 'bg-purple-950/60 border-purple-700/60 text-purple-200 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-600'
                              }`}
                            >
                              L{lvlIdx + 1}:{rem}/{max}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Short/Long Rest, End Turn & Minimize HUD */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleEncounterShortRest}
                      title="Short Rest: Spend 1 Hit Die to heal & refresh short-rest actions"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800"
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleEncounterLongRest}
                      title="Long Rest: Restore full HP, all Spell Slots & Hit Dice"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800"
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAdvanceTurn(1)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg transition-transform active:scale-95"
                    >
                      <span>End Turn</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsBottomHudCollapsed(true)}
                      title="Collapse Bottom HUD"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Strip of Dock: Hotbar Category Tabs & Interactive Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                  {/* Category Selector Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                    {[
                      {
                        id: 'move',
                        label: 'Move',
                        icon: Footprints,
                        count: playingMonsterProfile?.movementModes?.length || undefined,
                      },
                      {
                        id: 'actions',
                        label: 'Actions',
                        icon: Swords,
                        count: characterOrMonsterActions.length,
                      },
                      { id: 'spells', label: 'Spells', icon: Sparkles, count: spellsCount || undefined },
                      { id: 'items', label: 'Items', icon: Backpack, count: itemsCount || undefined },
                      { id: 'features', label: 'Features', icon: Award, count: featuresCount || undefined },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const active = hudCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setHudCategory(tab.id as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span
                              className={`text-[10px] font-mono-numbers px-1 rounded ${
                                active ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Category Hotbar Deck */}
                  <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
                    {/* 1. MOVE TAB */}
                    {hudCategory === 'move' && (
                      <>
                        {playingMonsterProfile && playingMonsterProfile.movementModes.length > 1 ? (
                          playingMonsterProfile.movementModes.map(m => {
                            const isSelectedMode = activePlayingMoveMode === m.mode;
                            return (
                              <button
                                key={m.mode}
                                onClick={() => {
                                  setTokenMoveMode(prev => ({ ...prev, [playingToken.id]: m.mode }));
                                  setActiveTool('move');
                                  setTargetingAction(null);
                                  triggerCombatBanner(
                                    `${playingToken.name} switched to ${m.mode} speed (${m.speed} ft)`
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${
                                  isSelectedMode && activeTool === 'move'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                                <span>
                                  {m.mode} ({m.speed} ft)
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTool('move');
                              setTargetingAction(null);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${
                              activeTool === 'move'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Walk / Click Grid ({playingMoveRemaining} ft left)</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsDashing(prev => ({
                              ...prev,
                              [playingToken.id]: !prev[playingToken.id],
                            }));
                            updatePlayingEconomy({ hasAction: false });
                            triggerCombatBanner(`${playingToken.name} used Dash (Speed doubled)!`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${
                            playingIsDashing
                              ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>{playingIsDashing ? 'Dashing (2x Speed)' : 'Dash (+Speed)'}</span>
                        </button>

                        <button
                          onClick={() => {
                            updatePlayingEconomy({ hasAction: false });
                            triggerCombatBanner(
                              `${playingToken.name} took the Disengage action (no Opportunity Attacks this turn).`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold shrink-0"
                        >
                          Disengage
                        </button>

                        <button
                          onClick={() =>
                            handleActivateActionOrSpell({
                              name: 'Jump / Reposition',
                              actionCost: 'Bonus Action',
                              rangeFeet: 30,
                              aoeShape: 'circle',
                              aoeSizeFeet: 5,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold shrink-0"
                        >
                          Jump / Reposition
                        </button>
                      </>
                    )}

                    {/* 2. ACTIONS TAB (Monster or Character Weapon Attacks + Core Combat Actions) */}
                    {hudCategory === 'actions' && (
                      <>
                        {characterOrMonsterActions.map((atk, idx) => {
                          const onCooldown = Boolean(
                            playingToken && expendedRecharges[playingToken.id]?.[atk.name]
                          );
                          return (
                            <EncyclopediaTooltip
                              key={idx}
                              entryName={atk.name}
                              category="items"
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{
                                damage: atk.damage,
                                damageType: atk.damageType,
                                range: `${atk.rangeFeet} ft${
                                  atk.aoeShape && atk.aoeShape !== 'circle'
                                    ? ` (${atk.aoeSizeFeet}-ft ${atk.aoeShape})`
                                    : ''
                                }`,
                                actionType: atk.actionCost,
                                saveDc: atk.saveType,
                                desc: atk.desc,
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleActivateActionOrSpell(atk);
                                }}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                                  onCooldown
                                    ? 'bg-slate-950 border-red-800/60 text-slate-400 hover:border-amber-500'
                                    : 'bg-slate-900 hover:bg-slate-800 hover:border-amber-500/60 border-slate-800 text-slate-100'
                                }`}
                              >
                                <Swords className="w-3.5 h-3.5 text-amber-400" />
                                <span>{atk.name}</span>
                                {atk.attackBonus !== undefined && !atk.saveType && (
                                  <span className="text-[10px] font-mono-numbers text-amber-300">
                                    +{atk.attackBonus}
                                  </span>
                                )}
                                {atk.damage && (
                                  <span className="text-[10px] font-mono-numbers text-red-300 ml-0.5">
                                    {atk.damage}
                                  </span>
                                )}
                                {atk.aoeShape && atk.aoeShape !== 'circle' && atk.aoeShape !== 'self' && (
                                  <span className="text-[9px] uppercase tracking-wider px-1 rounded bg-amber-500/15 text-amber-300">
                                    {atk.aoeSizeFeet}ft {atk.aoeShape}
                                  </span>
                                )}
                                {onCooldown && (
                                  <span className="text-[9px] uppercase px-1 rounded bg-red-950 text-red-300 border border-red-800">
                                    Roll d6 ({atk.rechargeMin}–6)
                                  </span>
                                )}
                              </button>
                            </EncyclopediaTooltip>
                          );
                        })}

                        {CORE_COMBAT_ACTIONS.slice(1, 8).map(act => (
                          <EncyclopediaTooltip
                            key={act.name}
                            entryName={act.name}
                            category="actions"
                            library={library}
                            onOpenFullEntry={onOpenEncyclopediaEntry}
                            fallbackStats={{
                              desc: act.desc,
                              actionType: act.type,
                              range: `${act.rangeFeet} ft`,
                            }}
                          >
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleActivateActionOrSpell({
                                  name: act.name,
                                  actionCost: act.type as any,
                                  rangeFeet: act.rangeFeet,
                                  aoeShape: act.aoeShape as any,
                                  aoeSizeFeet: act.aoeSizeFeet,
                                  damage: act.damage,
                                  damageType: act.damageType,
                                  desc: act.desc,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 transition-colors"
                            >
                              {act.name}
                            </button>
                          </EncyclopediaTooltip>
                        ))}
                      </>
                    )}

                    {/* 3. SPELLS TAB (Party Member Spells + Monster Spellcasting / Breath & Magical Abilities) */}
                    {hudCategory === 'spells' && (
                      <>
                        {playingPartyMember?.spells &&
                          playingPartyMember.spells.map((sp, idx) => {
                            const isBonus = sp.castingTime?.toLowerCase().includes('bonus');
                            const isReaction = sp.castingTime?.toLowerCase().includes('reaction');
                            const cost: ActiveTargetingAction['actionCost'] = isBonus
                              ? 'Bonus Action'
                              : isReaction
                              ? 'Reaction'
                              : 'Action';
                            const rangeNum = parseInt(sp.range || '60', 10) || 60;
                            const isSelf = sp.range?.toLowerCase().includes('self');
                            const isSphere =
                              sp.name.toLowerCase().includes('fireball') ||
                              sp.desc?.toLowerCase().includes('sphere');
                            const saveMatch = sp.desc?.match(/(STR|DEX|CON|INT|WIS|CHA)\s+save/i);

                            return (
                              <EncyclopediaTooltip
                                key={idx}
                                entryName={sp.name}
                                category="spells"
                                library={library}
                                onOpenFullEntry={onOpenEncyclopediaEntry}
                                fallbackStats={{
                                  level: sp.level,
                                  school: sp.school,
                                  damage: sp.damage,
                                  damageType: sp.damageType,
                                  healing: sp.healing,
                                  range: sp.range,
                                  actionType: sp.castingTime,
                                  desc: sp.desc,
                                }}
                              >
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleActivateActionOrSpell({
                                      name: sp.name,
                                      actionCost: cost,
                                      rangeFeet: isSelf ? 0 : rangeNum,
                                      aoeShape: isSelf ? 'self' : isSphere ? 'sphere' : 'circle',
                                      aoeSizeFeet: isSphere ? 20 : 5,
                                      damage: sp.damage,
                                      damageType: sp.damageType,
                                      healing: sp.healing,
                                      saveType: isSphere
                                        ? 'DEX Save'
                                        : saveMatch
                                        ? `${saveMatch[1].toUpperCase()} Save`
                                        : undefined,
                                      saveDc: playingPartyMember.spellSaveDc || 15,
                                      attackBonus: playingPartyMember.spellcasting?.spellAttackBonus || 6,
                                      spellLevel: sp.level,
                                      desc: sp.desc,
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-100 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                  <span>{sp.name}</span>
                                  <span className="text-[10px] font-mono-numbers text-purple-300">
                                    L{sp.level}
                                  </span>
                                  {sp.damage && (
                                    <span className="text-[10px] font-mono-numbers text-red-300">
                                      {sp.damage}
                                    </span>
                                  )}
                                  {sp.healing && (
                                    <span className="text-[10px] font-mono-numbers text-emerald-300">
                                      +{sp.healing}
                                    </span>
                                  )}
                                </button>
                              </EncyclopediaTooltip>
                            );
                          })}

                        {/* Monster Spells & Supernatural / Breath Abilities */}
                        {playingMonsterProfile?.spells &&
                          playingMonsterProfile.spells.map((sp, idx) => (
                            <EncyclopediaTooltip
                              key={`mon_sp_${idx}`}
                              entryName={sp.name}
                              category="spells"
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{
                                level: sp.spellLevel,
                                damage: sp.damage,
                                damageType: sp.damageType,
                                healing: sp.healing,
                                range: `${sp.rangeFeet} ft`,
                                actionType: sp.actionCost,
                                saveDc: sp.saveType,
                                desc: sp.desc,
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleActivateActionOrSpell(sp);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-100 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                <span>{sp.name}</span>
                                {sp.spellLevel !== undefined && (
                                  <span className="text-[10px] font-mono-numbers text-purple-300">
                                    L{sp.spellLevel}
                                  </span>
                                )}
                                {sp.damage && (
                                  <span className="text-[10px] font-mono-numbers text-red-300">
                                    {sp.damage}
                                  </span>
                                )}
                                {sp.healing && (
                                  <span className="text-[10px] font-mono-numbers text-emerald-300">
                                    +{sp.healing}
                                  </span>
                                )}
                              </button>
                            </EncyclopediaTooltip>
                          ))}

                        {showAllSrdSpells &&
                          CORE_COMBAT_ACTIONS.slice(8).map(sp => (
                            <EncyclopediaTooltip
                              key={sp.name}
                              entryName={sp.name}
                              category="spells"
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{
                                damage: sp.damage,
                                damageType: sp.damageType,
                                healing: sp.healing,
                                range: `${sp.rangeFeet} ft`,
                                actionType: sp.type,
                                desc: sp.desc,
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleActivateActionOrSpell({
                                    name: sp.name,
                                    actionCost: sp.type as any,
                                    rangeFeet: sp.rangeFeet,
                                    aoeShape: sp.aoeShape as any,
                                    aoeSizeFeet: sp.aoeSizeFeet,
                                    damage: sp.damage,
                                    damageType: sp.damageType,
                                    healing: sp.healing,
                                    saveType: sp.saveType,
                                    desc: sp.desc,
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0"
                              >
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>{sp.name}</span>
                              </button>
                            </EncyclopediaTooltip>
                          ))}

                        <button
                          onClick={() => setShowAllSrdSpells(!showAllSrdSpells)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs font-medium shrink-0"
                        >
                          {showAllSrdSpells ? 'Hide Extra AoE Spells' : '+ AoE Spells'}
                        </button>
                      </>
                    )}

                    {/* 4. ITEMS TAB (Party Member Equipment OR Monster Equipped Weapons & Armor) */}
                    {hudCategory === 'items' && (
                      <>
                        {playingPartyMember?.equipment && playingPartyMember.equipment.length > 0 ? (
                          playingPartyMember.equipment.map((item, idx) => {
                            const desc = item.desc || '';
                            const isPotion =
                              item.name.toLowerCase().includes('potion') ||
                              desc.toLowerCase().includes('heal');
                            const healMatch = desc.match(/(\d+d\d+(?:\+\d+)?)/);
                            const dmgMatch = desc.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*([a-zA-Z]+)?/);

                            return (
                              <EncyclopediaTooltip
                                key={idx}
                                entryName={item.name}
                                category="items"
                                library={library}
                                onOpenFullEntry={onOpenEncyclopediaEntry}
                                fallbackStats={{ desc: item.desc }}
                              >
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (isPotion) {
                                      handleActivateActionOrSpell({
                                        name: item.name,
                                        actionCost: 'Bonus Action',
                                        rangeFeet: 5,
                                        aoeShape: 'circle',
                                        aoeSizeFeet: 5,
                                        healing: healMatch ? healMatch[1] : '2d4+2',
                                        itemIndex: idx,
                                        desc: item.desc,
                                      });
                                    } else if (dmgMatch) {
                                      const isRanged =
                                        desc.toLowerCase().includes('range') ||
                                        desc.toLowerCase().includes('thrown') ||
                                        item.name.toLowerCase().includes('bow');
                                      handleActivateActionOrSpell({
                                        name: item.name,
                                        actionCost: 'Action',
                                        rangeFeet: isRanged ? 60 : 5,
                                        aoeShape: 'circle',
                                        aoeSizeFeet: 5,
                                        damage: dmgMatch[1].replace(/\s+/g, ''),
                                        damageType: dmgMatch[2] || 'Physical',
                                        desc: item.desc,
                                      });
                                    } else {
                                      triggerCombatBanner(`${playingToken.name} equipped/used ${item.name}`);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0"
                                >
                                  <Backpack className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{item.name}</span>
                                  <span className="text-[10px] font-mono-numbers text-slate-400">
                                    x{item.quantity}
                                  </span>
                                </button>
                              </EncyclopediaTooltip>
                            );
                          })
                        ) : playingMonsterProfile?.items && playingMonsterProfile.items.length > 0 ? (
                          playingMonsterProfile.items.map((item, idx) => (
                            <EncyclopediaTooltip
                              key={`mon_item_${idx}`}
                              entryName={item.name}
                              category="items"
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{
                                damage: item.action?.damage,
                                damageType: item.action?.damageType,
                                range: item.action ? `${item.action.rangeFeet} ft` : undefined,
                                desc: item.desc,
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (item.action) {
                                    handleActivateActionOrSpell(item.action);
                                  } else {
                                    triggerCombatBanner(`${playingToken.name}: ${item.name} (${item.desc})`);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0"
                              >
                                {item.isWeapon ? (
                                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                                )}
                                <span>{item.name}</span>
                                {item.action?.damage && (
                                  <span className="text-[10px] font-mono-numbers text-red-300">
                                    {item.action.damage}
                                  </span>
                                )}
                              </button>
                            </EncyclopediaTooltip>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 px-2">No inventory items recorded.</span>
                        )}
                      </>
                    )}

                    {/* 5. FEATURES TAB (Party Class/Species Features OR Monster Traits, Immunities, Senses & Legendary Actions) */}
                    {hudCategory === 'features' && (
                      <>
                        {playingPartyMember?.features && playingPartyMember.features.length > 0 ? (
                          playingPartyMember.features.map((feat, idx) => (
                            <EncyclopediaTooltip
                              key={idx}
                              entryName={feat.name}
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{ desc: feat.desc }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  const fn = feat.name.toLowerCase();
                                  if (fn.includes('second wind')) {
                                    const rolled = rollDiceFormula('1d10+5', false);
                                    syncHpForToken(playingToken.id, playingToken.hp + rolled.total);
                                    updatePlayingEconomy({ hasBonusAction: false });
                                    appendCombatLog({
                                      round,
                                      category: 'heal',
                                      title: `${playingToken.name} used Second Wind (+${rolled.total} HP)`,
                                      detail: `Roll: ${rolled.breakdown}`,
                                      outcome: 'hit',
                                    });
                                    triggerCombatBanner(
                                      `${playingToken.name} used Second Wind (+${rolled.total} HP)!`
                                    );
                                  } else if (fn.includes('action surge')) {
                                    updatePlayingEconomy({ hasAction: true });
                                    appendCombatLog({
                                      round,
                                      category: 'utility',
                                      title: `${playingToken.name} activated Action Surge!`,
                                      detail: `Action restored for this turn.`,
                                      outcome: 'info',
                                    });
                                    triggerCombatBanner(
                                      `${playingToken.name} activated Action Surge (Action restored)!`
                                    );
                                  } else if (fn.includes('preserve life')) {
                                    handleActivateActionOrSpell({
                                      name: feat.name,
                                      actionCost: 'Action',
                                      rangeFeet: 30,
                                      aoeShape: 'sphere',
                                      aoeSizeFeet: 15,
                                      healing: '25',
                                      desc: feat.desc,
                                    });
                                  } else {
                                    triggerCombatBanner(`${playingToken.name}: ${feat.name} active`);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>{feat.name}</span>
                              </button>
                            </EncyclopediaTooltip>
                          ))
                        ) : playingMonsterProfile?.features && playingMonsterProfile.features.length > 0 ? (
                          playingMonsterProfile.features.map((feat, idx) => (
                            <EncyclopediaTooltip
                              key={`mon_feat_${idx}`}
                              entryName={feat.name.replace(/^Legendary:\s*/i, '')}
                              library={library}
                              onOpenFullEntry={onOpenEncyclopediaEntry}
                              fallbackStats={{
                                desc: feat.desc,
                                actionType: feat.badge,
                                damage: feat.action?.damage,
                                damageType: feat.action?.damageType,
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (feat.action) {
                                    handleActivateActionOrSpell(feat.action);
                                  } else {
                                    triggerCombatBanner(`${playingToken.name}: ${feat.name} — ${feat.desc}`);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>{feat.name}</span>
                                {feat.badge && (
                                  <span className="text-[9px] uppercase tracking-wider px-1 rounded bg-slate-800 text-slate-300">
                                    {feat.badge}
                                  </span>
                                )}
                              </button>
                            </EncyclopediaTooltip>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 px-2">
                            No special features or traits recorded.
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SRD 5.2.1 Character Builder Modal (accessible from Encounter Spawn menu) */}
      <CharacterBuilderModal
        isOpen={showCharacterBuilderModal}
        onClose={() => setShowCharacterBuilderModal(false)}
        library={library}
        onCreateCharacter={newMember => {
          onUpdateParty?.([...party, newMember]);
          spawnPartyToken(newMember);
        }}
      />
    </div>
  );
};
