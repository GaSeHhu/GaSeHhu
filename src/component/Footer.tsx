import { Box, Container, Link, Typography } from "@mui/material";
import { localize } from "../lib/i18n";

export function Footer() {
  const footerLinks = [
    {
      text: localize('home'),
      href: 'https://gasehhu.github.io/',
    },
    {
      text: 'GitHub',
      href: 'https://github.com/GaSeHhu/GaSeHhu',
    },
    {
      text: localize('issues'),
      href: 'https://github.com/GaSeHhu/GaSeHhu/issues',
    },
  ];
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center" fontWeight="fontWeightBold" sx={{ pb: 1 }}>
          {localize('gasehhu')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{
          fontSize: 12,
        }}>
          {
            footerLinks.flatMap((link, i) => {
              if (i === 0) {
                return (
                  <Link
                    key={`link-${i}`}
                    variant="caption"
                    color="secondary.main"
                    underline="none"
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                  >
                    {link.text}
                  </Link>
                );
              }
              return [
                <Typography
                key={`separator-${i}`}
                  component="span"
                  variant="caption"
                  sx={{
                    ml: 1,
                    mr: 1,
                  }}
                >|</Typography>,
                <Link
                  key={`link-${i}`}
                  variant="caption"
                  color="secondary.main"
                  underline="none"
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                >
                  {link.text}
                </Link>
              ];
            })
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{
          fontSize: 10,
        }}>
          © 2023 under the terms of the <Link underline="none" href="https://github.com/GaSeHhu/GaSeHhu/blob/master/LICENSE" target="_blank" rel="noopener">MIT license</Link>.
        </Typography>
      </Container>
    </Box>
  );
}