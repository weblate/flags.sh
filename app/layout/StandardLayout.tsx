import { Center, Container, Stack } from "@mantine/core";
import { Header } from "~/component/Header";
import { PropsWithChildren } from "react";
import { Footer } from "~/component/Footer";
import { ThemePaper } from "@encode42/mantine-extras";

export function StandardLayout({ children }: PropsWithChildren) {
    return (
        <Container>
            <Center sx={{
                "minHeight": "100vh"
            }}>
                <Stack sx={{
                    "width": "100%"
                }}>
                    <Header />
                    <ThemePaper>
                        {children}
                    </ThemePaper>
                    <Footer />
                </Stack>
            </Center>
        </Container>
    );
}
