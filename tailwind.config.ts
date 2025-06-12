import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-bricolage)', 'var(--font-geist)'],
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					h1: {
  						fontSize: '2.25rem',
  						fontWeight: '700',
  						marginTop: '2rem',
  						marginBottom: '1rem'
  					},
  					h2: {
  						fontSize: '1.875rem',
  						fontWeight: '600',
  						marginTop: '1.75rem',
  						marginBottom: '0.75rem'
  					},
  					h3: {
  						fontSize: '1.5rem',
  						fontWeight: '600',
  						marginTop: '1.5rem',
  						marginBottom: '0.75rem'
  					},
  					h4: {
  						fontSize: '1.25rem',
  						fontWeight: '600',
  						marginTop: '1.25rem',
  						marginBottom: '0.5rem'
  					},
  					h5: {
  						fontSize: '1.125rem',
  						fontWeight: '600',
  						marginTop: '1.25rem',
  						marginBottom: '0.5rem'
  					},
  					h6: {
  						fontSize: '1rem',
  						fontWeight: '600',
  						marginTop: '1.25rem',
  						marginBottom: '0.5rem'
  					}
  				}
  			}
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			nuclear: '#9000FF',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  		},
  		backgroundImage: {
			'custom-gradient': 'radial-gradient(50% 75% at 50% 50%, #F3EBE6 10%, rgba(243, 235, 230, 0.00) 100%), conic-gradient(from 90deg at 50% 50%, #9000FF 80deg, #00D3BE 160deg, #E46300 220deg, #E16009 330deg, #9000FF 360deg)',
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;
