# COLORIZE.md - Systematic UI State Indication System

## Color Coding System for values.md Platform

### 🎨 Color Palette & Semantic Meaning

| Color | Usage | Meaning | UI Elements |
|-------|-------|---------|-------------|
| **🟡 Gold** (`#FFD700`, `bg-yellow-400`) | LLM Inference Available | OpenRouter API key is configured and working | CTA buttons, status indicators, generation buttons |
| **🔴 Maroon** (`#800000`, `bg-red-800`) | Destructive Actions | Will modify/delete database data | Admin delete buttons, reset actions, data cleanup |
| **🔵 Cyan** (`#00FFFF`, `bg-cyan-400`) | Data Available | We have user responses/dilemmas loaded | Data display sections, analysis buttons, export options |
| **🟦 Navy** (`#000080`, `bg-blue-900`) | VALUES.md Ready | Generated VALUES.md file is prepared | Download buttons, share actions, integration tools |
| **⚪ Grey** (`#808080`, `bg-gray-400`) | Unavailable/Disabled | Feature not available or requirements not met | Disabled buttons, missing prerequisites |

### 🔧 Implementation Standards

#### 1. **Gold - LLM Inference Available**
```tsx
// Status Indicator
<div className={`w-3 h-3 rounded-full ${hasOpenRouterKey ? 'bg-yellow-400 shadow-yellow-400/50 shadow-lg' : 'bg-gray-400'}`} />

// CTA Buttons
<Button className={hasOpenRouterKey ? 'bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-400/30' : 'bg-gray-400 cursor-not-allowed'}>
  Generate with AI
</Button>

// Glow Light Component
<GlowLight 
  active={hasOpenRouterKey} 
  color="gold" 
  tooltip={hasOpenRouterKey ? "OpenRouter API ready" : "Configure API key in admin"} 
/>
```

#### 2. **Maroon - Destructive Actions**
```tsx
// Destructive Buttons
<Button className="bg-red-800 hover:bg-red-900 text-white border-2 border-red-600">
  🗑️ Clear All Data
</Button>

// Warning States
<Card className="border-red-800 bg-red-50">
  <CardHeader className="bg-red-800 text-white">
    ⚠️ Destructive Action
  </CardHeader>
</Card>
```

#### 3. **Cyan - Data Available**
```tsx
// Data Sections
<Card className={`${hasUserResponses ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300 bg-gray-50'}`}>
  <CardHeader>
    <CardTitle className={hasUserResponses ? 'text-cyan-800' : 'text-gray-600'}>
      📊 User Responses {hasUserResponses && <span className="text-cyan-600">({responseCount})</span>}
    </CardTitle>
  </CardHeader>
</Card>

// Analysis Buttons
<Button className={hasUserResponses ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-400 cursor-not-allowed'}>
  Analyze Data
</Button>
```

#### 4. **Navy - VALUES.md Ready**
```tsx
// Download/Export Actions
<Button className={hasGeneratedValues ? 'bg-blue-900 hover:bg-blue-950 text-white' : 'bg-gray-400 cursor-not-allowed'}>
  📥 Download VALUES.md
</Button>

// Integration Sections
<Card className={`${hasGeneratedValues ? 'border-blue-900 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
  <CardContent>
    <h3 className={hasGeneratedValues ? 'text-blue-900' : 'text-gray-600'}>
      🔗 Integration Ready
    </h3>
  </CardContent>
</Card>
```

#### 5. **Grey - Unavailable/Disabled**
```tsx
// Disabled States
<Button disabled className="bg-gray-400 text-gray-600 cursor-not-allowed">
  Feature Not Available
</Button>

// Missing Prerequisites
<div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
  <p className="text-gray-600">Complete previous steps to unlock this feature</p>
</div>
```

### 🌟 GlowLight Component Specification

```tsx
interface GlowLightProps {
  active: boolean;
  color: 'gold' | 'maroon' | 'cyan' | 'navy' | 'grey';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  onClick?: () => void;
}

const GlowLight = ({ active, color, size = 'md', tooltip, onClick }: GlowLightProps) => {
  const colors = {
    gold: active ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-gray-400',
    maroon: active ? 'bg-red-800 shadow-red-800/50' : 'bg-gray-400',
    cyan: active ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-gray-400',
    navy: active ? 'bg-blue-900 shadow-blue-900/50' : 'bg-gray-400',
    grey: 'bg-gray-400'
  };
  
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };
  
  return (
    <div 
      className={`
        ${sizes[size]} rounded-full ${colors[color]} 
        ${active ? 'animate-pulse shadow-lg' : ''} 
        ${onClick ? 'cursor-pointer hover:scale-110' : ''} 
        transition-all duration-300
      `}
      onClick={onClick}
      title={tooltip}
    />
  );
};
```

### 📍 Implementation Locations

#### **Admin Dashboard** (`/admin`)
- **Gold indicators**: OpenRouter API status, LLM generation buttons
- **Maroon indicators**: Database reset, clear all data, destructive admin actions
- **Cyan indicators**: Import sample data success, current data status
- **Navy indicators**: Test VALUES.md generation available

#### **Explore Page** (`/explore/[uuid]`)
- **Cyan indicators**: Response progress, data being collected
- **Gold indicators**: AI-powered features (if using LLM for dynamic dilemmas)

#### **Results Page** (`/results`)
- **Cyan indicators**: Responses available for analysis
- **Gold indicators**: AI generation options
- **Navy indicators**: VALUES.md ready for download/use

#### **Integration Page** (`/integration`)
- **Navy indicators**: VALUES.md file ready for bookmarklet
- **Gold indicators**: LLM testing features available

#### **Waterfall Page** (`/waterfall`)
- **Cyan indicators**: Data available for analysis
- **Navy indicators**: VALUES.md variants ready
- **Gold indicators**: AI-powered analysis features

#### **Debug/Health Pages**
- **Gold indicators**: API connections healthy
- **Maroon indicators**: Reset/cleanup actions
- **Cyan indicators**: Database has data
- **Navy indicators**: System ready for full operation

### 🔄 State Detection Logic

```tsx
// System State Detection Hooks
export const useSystemState = () => {
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false);
  const [hasUserResponses, setHasUserResponses] = useState(false);
  const [hasGeneratedValues, setHasGeneratedValues] = useState(false);
  const [databaseHasData, setDatabaseHasData] = useState(false);

  useEffect(() => {
    // Check OpenRouter API key
    fetch('/api/admin/check-env').then(res => res.json())
      .then(data => setHasOpenRouterKey(!!data.OPENROUTER_API_KEY));
    
    // Check localStorage for responses
    const responses = localStorage.getItem('responses');
    setHasUserResponses(!!responses && JSON.parse(responses).length > 0);
    
    // Check for generated VALUES.md
    const values = localStorage.getItem('generated-values');
    setHasGeneratedValues(!!values);
    
    // Check database status
    fetch('/api/health').then(res => res.json())
      .then(data => setDatabaseHasData(data.database.dilemmas > 0));
  }, []);

  return {
    hasOpenRouterKey,
    hasUserResponses,
    hasGeneratedValues,
    databaseHasData
  };
};
```

### 🎯 Priority Implementation Order

1. **GlowLight Component** - Base component for all status indicators
2. **Admin Dashboard** - Most critical for system management
3. **Results Page** - Key user completion flow
4. **Integration Page** - Essential for VALUES.md usage
5. **Debug/Health Pages** - System monitoring
6. **Explore/Waterfall Pages** - Enhanced UX

### 🔍 Accessibility & UX Notes

- All color coding MUST include text/icon alternatives for colorblind users
- Tooltip explanations required for all status indicators
- Consistent hover states and transitions
- Clear visual hierarchy: Gold (most important) → Navy → Cyan → Grey → Maroon (dangerous)

This systematic approach ensures users can instantly understand:
- What features are available (Gold/Active colors)
- What data they have (Cyan)
- What outputs are ready (Navy) 
- What actions are dangerous (Maroon)
- What's unavailable (Grey)

Implementation should be done component-by-component with the `useSystemState` hook providing consistent state detection across the entire application.